import * as exec from '@actions/exec';
import * as fs from 'fs';

/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
export async function launchEmulator(
  systemImageApiLevel: string,
  target: string,
  arch: string,
  profile: string,
  cores: string,
  ramSize: string,
  heapSize: string,
  sdcardPathOrSize: string,
  diskSize: string,
  avdName: string,
  forceAvdCreation: boolean,
  emulatorBootTimeout: number,
  port: number,
  emulatorOptions: string,
  disableAnimations: boolean,
  disableSpellChecker: boolean,
  disableLinuxHardwareAcceleration: boolean,
  enableHardwareKeyboard: boolean
): Promise<void> {
  try {
    console.log(`::group::Launch Emulator`);
    // create a new AVD if AVD directory does not already exist or forceAvdCreation is true
    const avdPath = `${process.env.ANDROID_AVD_HOME}/${avdName}.avd`;
    if (!fs.existsSync(avdPath) || forceAvdCreation) {
      const profileOption = profile.trim() !== '' ? `--device '${profile}'` : '';
      const sdcardPathOrSizeOption = sdcardPathOrSize.trim() !== '' ? `--sdcard '${sdcardPathOrSize}'` : '';
      console.log(`Creating AVD.`);
      await exec.exec(
        `sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --abi '${target}/${arch}' --package 'system-images;android-${systemImageApiLevel};${target};${arch}' ${profileOption} ${sdcardPathOrSizeOption}"`
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

    // turn off hardware acceleration on Linux
    if (process.platform === 'linux' && disableLinuxHardwareAcceleration) {
      console.log('Disabling Linux hardware acceleration.');
      emulatorOptions += ' -accel off';
    }

    // start emulator
    console.log('Starting emulator.');

    await exec.exec(`sh -c \\"${process.env.ANDROID_HOME}/emulator/emulator -port ${port} -avd "${avdName}" ${emulatorOptions} &"`, [], {
      listeners: {
        stderr: (data: Buffer) => {
          if (data.toString().includes('invalid command-line parameter')) {
            throw new Error(data.toString());
          }
        },
      },
    });

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
  } finally {
    console.log(`::endgroup::`);
  }
}

/**
 * Kills the running emulator on the default port.
 */
export async function killEmulator(port: number): Promise<void> {
  try {
    console.log(`::group::Terminate Emulator`);
    await adb(port, `emu kill`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  } finally {
    console.log(`::endgroup::`);
  }
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
