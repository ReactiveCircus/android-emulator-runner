import * as exec from '@actions/exec';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs';

/**
 * Creates a new AVD instance with the specified configurations.
 */
export async function createAvd(
  arch: string,
  avdName: string,
  cores: string,
  diskSize: string,
  enableHardwareKeyboard: boolean,
  forceAvdCreation: boolean,
  heapSize: string,
  profile: string,
  ramSize: string,
  sdcardPathOrSize: string,
  systemImageApiLevel: string,
  target: string,
): Promise<void> {
  try {
    console.log(`::group::Create AVD`);
    // create a new AVD if AVD directory does not already exist or forceAvdCreation is true
    const avdPath = `${process.env.ANDROID_AVD_HOME}/${avdName}.avd`;
    if (!fs.existsSync(avdPath) || forceAvdCreation) {
      const profileOption = profile.trim() !== '' ? `--device '${profile}'` : '';
      const sdcardPathOrSizeOption = sdcardPathOrSize.trim() !== '' ? `--sdcard '${sdcardPathOrSize}'` : '';
      console.log(`Creating AVD.`);
      await exec.exec(
        `sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --package 'system-images;android-${systemImageApiLevel};${target};${arch}' ${profileOption} ${sdcardPathOrSizeOption}"`,
      );
    }

    if (cores || ramSize || heapSize || enableHardwareKeyboard || diskSize) {
      const configEntries: string[] = [];

      if (cores) {
        configEntries.push(`hw.cpu.ncore=${cores}`);
      }
      if (ramSize) {
        configEntries.push(`hw.ramSize=${ramSize}`);
      }
      if (heapSize) {
        configEntries.push(`hw.heapSize=${heapSize}`);
      }
      if (enableHardwareKeyboard) {
        configEntries.push('hw.keyboard=yes');
      }
      if (diskSize) {
        configEntries.push(`disk.dataPartition.size=${diskSize}`);
      }

      if (configEntries.length > 0) {
        const configContent = configEntries.join('\\n') + '\\n';
        await exec.exec(`sh -c \\"printf '${configContent}' >> ${process.env.ANDROID_AVD_HOME}/"${avdName}".avd"/config.ini"`);
      }
    }
  } finally {
    console.log(`::endgroup::`);
  }
}

/**
 * Launches an existing AVD instance with the specified configurations.
 */
export async function launchEmulator(
  avdName: string,
  disableAnimations: boolean,
  disableLinuxHardwareAcceleration: boolean,
  disableSpellChecker: boolean,
  emulatorBootTimeout: number,
  emulatorOptions: string,
  enableHardwareKeyboard: boolean,
  port: number,
): Promise<ChildProcessWithoutNullStreams> {
  try {
    console.log(`::group::Launch Emulator`);

    // turn off hardware acceleration on Linux
    if (process.platform === 'linux' && disableLinuxHardwareAcceleration) {
      console.log('Disabling Linux hardware acceleration.');
      emulatorOptions += ' -accel off';
    }

    // start emulator
    console.log('Starting emulator.');

    const command = `${process.env.ANDROID_HOME}/emulator/emulator -port ${port} -avd "${avdName}" ${emulatorOptions}`;
    console.log(`[command]${command}`);
    // detached, so the emulator leads a process group of its own and stopEmulator can kill it with the processes it starts
    const emulator = spawn('sh', ['-c', `exec ${command}`], { detached: true });
    emulator.stdout.on('data', (data: Buffer) => process.stdout.write(data));
    emulator.stderr.on('data', (data: Buffer) => {
      process.stderr.write(data);
      if (data.toString().includes('invalid command-line parameter')) {
        throw new Error(data.toString());
      }
    });

    try {
      // wait for emulator to complete booting
      await waitForDevice(port, emulatorBootTimeout);
      await adb(port, `shell input keyevent 82`);

      if (disableAnimations) {
        console.log('Disabling animations.');
        await adb(port, `shell settings put global window_animation_scale 0.0`);
        await adb(port, `shell settings put global transition_animation_scale 0.0`);
        await adb(port, `shell settings put global animator_duration_scale 0.0`);
      }
      if (disableSpellChecker) {
        await adb(port, `shell settings put secure spell_checker_enabled 0`);
      }
      if (enableHardwareKeyboard) {
        await adb(port, `shell settings put secure show_ime_with_hard_keyboard 0`);
      }
    } catch (error) {
      await stopEmulator(emulator, port);
      throw error;
    }
    return emulator;
  } finally {
    console.log(`::endgroup::`);
  }
}

/**
 * Kills the emulator started by launchEmulator and waits for it to exit.
 */
export async function killEmulator(emulator: ChildProcessWithoutNullStreams, port: number): Promise<void> {
  try {
    console.log(`::group::Terminate Emulator`);
    await stopEmulator(emulator, port);
  } finally {
    console.log(`::endgroup::`);
  }
}

/**
 * Asks the emulator to shut down, and kills its process group if it is still running once the
 * emulator's own shutdown wait has passed: ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL seconds, 20 by default.
 */
async function stopEmulator(emulator: ChildProcessWithoutNullStreams, port: number): Promise<void> {
  try {
    await adb(port, `emu kill`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }

  const shutdownWaitSeconds = getEmulatorShutdownWaitSeconds();
  if (!(await waitForExit(emulator, shutdownWaitSeconds * 1000)) && emulator.pid !== undefined) {
    console.log(`The emulator is still running ${shutdownWaitSeconds} seconds after it was asked to shut down, killing it.`);
    try {
      process.kill(-emulator.pid, 'SIGKILL');
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
    }
    await waitForExit(emulator);
  }

  // processes the emulator starts in a session of their own, such as crashpad_handler, can outlive it holding its output
  emulator.stdout.destroy();
  emulator.stderr.destroy();
}

function getEmulatorShutdownWaitSeconds(): number {
  const seconds = parseInt(process.env.ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL ?? '', 10);
  return seconds >= 0 ? seconds : 20;
}

/**
 * Resolves true once the emulator has exited, or false when timeoutMs passes first.
 */
function waitForExit(emulator: ChildProcessWithoutNullStreams, timeoutMs?: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (emulator.exitCode !== null || emulator.signalCode !== null) {
      resolve(true);
      return;
    }
    let timeout: NodeJS.Timeout | undefined;
    const onExit = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    emulator.once('exit', onExit);
    if (timeoutMs !== undefined) {
      timeout = setTimeout(() => {
        emulator.off('exit', onExit);
        resolve(false);
      }, timeoutMs);
    }
  });
}

async function adb(port: number, command: string): Promise<number> {
  return await exec.exec(`adb -s emulator-${port} ${command}`);
}

/**
 * Wait for emulator to boot.
 */
async function waitForDevice(port: number, emulatorBootTimeout: number): Promise<void> {
  let booted = false;
  let attempts = 0;
  const retryInterval = 2; // retry every 2 seconds
  const maxAttempts = emulatorBootTimeout / 2;
  while (!booted) {
    try {
      let result = '';
      await exec.exec(`adb -s emulator-${port} shell getprop sys.boot_completed`, [], {
        listeners: {
          stdout: (data: Buffer) => {
            result += data.toString();
          },
        },
      });
      if (result.trim() === '1') {
        console.log('Emulator booted.');
        booted = true;
        break;
      }
    } catch (error) {
      console.warn(error instanceof Error ? error.message : error);
    }

    if (attempts < maxAttempts) {
      await delay(retryInterval * 1000);
    } else {
      throw new Error(`Timeout waiting for emulator to boot.`);
    }
    attempts++;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
