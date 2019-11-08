import * as exec from '@actions/exec';

const EMULATOR_BOOT_TIMEOUT_SECONDS = 120;
const AVD_MANAGER_PATH = `${process.env.ANDROID_HOME}/tools/bin/avdmanager`;
const ADB_PATH = `${process.env.ANDROID_HOME}/platform-tools/adb`;

/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
export async function launchEmulator(apiLevel: number, target: string, arch: string, profile: string, headless: boolean, disableAnimations: boolean): Promise<void> {
  // create a new AVD
  if (profile.trim() !== '') {
    console.log(`Creating AVD with custom profile ${profile}`);
    await exec.exec(`${AVD_MANAGER_PATH} create avd --force -n test --abi "${target}/${arch}" --package "system-images;android-${apiLevel};${target};${arch}" --device "${profile}"`);
  } else {
    console.log(`Creating AVD without custom profile.`);
    await exec.exec(`bash -c \\"echo no | ${AVD_MANAGER_PATH} create avd --force -n test --abi '${target}/${arch}' --package 'system-images;android-${apiLevel};${target};${arch}'`);
  }

  // start emulator
  console.log('Starting emulator.');
  const noWindow = headless ? '-no-window' : '';
  await exec.exec(`bash -c \\"${process.env.ANDROID_HOME}/emulator/emulator -avd test ${noWindow} -no-snapshot -noaudio -no-boot-anim &"`);

  // wait for emulator to complete booting
  await waitForDevice();
  await exec.exec(`${ADB_PATH} shell input keyevent 82`);

  // disable animations
  if (disableAnimations) {
    console.log('Disabling animations.');
    await exec.exec(`${ADB_PATH} shell settings put global window_animation_scale 0.0`);
    await exec.exec(`${ADB_PATH} shell settings put global transition_animation_scale 0.0`);
    await exec.exec(`${ADB_PATH} shell settings put global animator_duration_scale 0.0`);
  }
}

/**
 * Kills the running emulator on the defaut port.
 */
export async function killEmulator(): Promise<void> {
  try {
    await exec.exec(`${ADB_PATH} -s emulator-5554 emu kill`);
  } catch (error) {
    console.log('No emulator running on port 5554');
  }
}

/**
 * Wait for emulator to boot.
 */
async function waitForDevice(): Promise<void> {
  const adbPath = `${process.env.ANDROID_HOME}/platform-tools/adb`;
  let booted = false;
  let attempts = 0;
  const retryInterval = 2; // retry every 2 seconds
  const maxAttemps = EMULATOR_BOOT_TIMEOUT_SECONDS / 2;
  while (!booted) {
    try {
      let result = '';
      await exec.exec(`${adbPath} shell getprop sys.boot_completed`, [], {
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
      console.error(error.message);
    }

    if (attempts < maxAttemps) {
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
