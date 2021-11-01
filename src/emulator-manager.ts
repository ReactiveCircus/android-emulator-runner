import * as exec from '@actions/exec';
import * as fs from 'fs';

const EMULATOR_BOOT_TIMEOUT_SECONDS = 600;

/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
export async function launchEmulator(
  apiLevel: number,
  target: string,
  arch: string,
  profile: string,
  cores: string,
  ramSize: string,
  sdcardPathOrSize: string,
  avdName: string,
  forceAvdCreation: boolean,
  emulatorOptions: string,
  disableAnimations: boolean,
  disableSpellChecker: boolean,
  disableLinuxHardwareAcceleration: boolean
): Promise<void> {
  // create a new AVD if AVD directory does not already exist or forceAvdCreation is true
  const avdPath = `${process.env.ANDROID_AVD_HOME}/${avdName}.avd`;
  if (!fs.existsSync(avdPath) || forceAvdCreation) {
    const profileOption = profile.trim() !== '' ? `--device '${profile}'` : '';
    const sdcardPathOrSizeOption = sdcardPathOrSize.trim() !== '' ? `--sdcard '${sdcardPathOrSize}'` : '';
    console.log(`Creating AVD.`);
    await exec.exec(
      `sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --abi '${target}/${arch}' --package 'system-images;android-${apiLevel};${target};${arch}' ${profileOption} ${sdcardPathOrSizeOption}"`
    );
  }

  if (cores) {
    await exec.exec(`sh -c \\"printf 'hw.cpu.ncore=${cores}\n' >> ${process.env.ANDROID_AVD_HOME}/"${avdName}".avd"/config.ini`);
  }

  if (ramSize) {
    await exec.exec(`sh -c \\"printf 'hw.ramSize=${ramSize}\n' >> ${process.env.ANDROID_AVD_HOME}/"${avdName}".avd"/config.ini`);
  }

  //turn off hardware acceleration on Linux
  if (process.platform === 'linux' && disableLinuxHardwareAcceleration) {
    console.log('Disabling Linux hardware acceleration.');
    emulatorOptions += ' -accel off';
  }

  // start emulator
  console.log('Starting emulator.');

  await exec.exec(`sh -c \\"${process.env.ANDROID_SDK_ROOT}/emulator/emulator -avd "${avdName}" ${emulatorOptions} &"`, [], {
    listeners: {
      stderr: (data: Buffer) => {
        if (data.toString().includes('invalid command-line parameter')) {
          throw new Error(data.toString());
        }
      }
    }
  });

  // wait for emulator to complete booting
  await waitForDevice();
  await exec.exec(`adb shell input keyevent 82`);

  // disable animations
  if (disableAnimations) {
    console.log('Disabling animations.');
    await exec.exec(`adb shell settings put global window_animation_scale 0.0`);
    await exec.exec(`adb shell settings put global transition_animation_scale 0.0`);
    await exec.exec(`adb shell settings put global animator_duration_scale 0.0`);
  }
  if (disableSpellChecker) {
    await exec.exec(`adb shell settings put secure spell_checker_enabled 0`);
  }
}

/**
 * Kills the running emulator on the default port.
 */
export async function killEmulator(): Promise<void> {
  try {
    await exec.exec(`adb -s emulator-5554 emu kill`);
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * Wait for emulator to boot.
 */
async function waitForDevice(): Promise<void> {
  let booted = false;
  let attempts = 0;
  const retryInterval = 2; // retry every 2 seconds
  const maxAttempts = EMULATOR_BOOT_TIMEOUT_SECONDS / 2;
  while (!booted) {
    try {
      let result = '';
      await exec.exec(`adb shell getprop sys.boot_completed`, [], {
        listeners: {
          stdout: (data: Buffer) => {
            result += data.toString();
          }
        }
      });
      if (result.trim() === '1') {
        console.log('Emulator booted.');
        booted = true;
        break;
      }
    } catch (error) {
      console.warn(error.message);
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
  return new Promise(resolve => setTimeout(resolve, ms));
}
