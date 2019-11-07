import * as exec from '@actions/exec';

const EMULATOR_BOOT_TIMEOUT_SECONDS = 120;

/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
export async function launchEmulator(apiLevel: number, target: string, abi: string, device: string, headless: boolean, disableAnimations: boolean): Promise<void> {
  const avdmangerPath = `${process.env.ANDROID_HOME}/tools/bin/avdmanager`;
  const adbPath = `${process.env.ANDROID_HOME}/platform-tools/adb`;

  // create a new AVD
  console.log('Creating AVD.');
  await exec.exec(`${avdmangerPath} create avd -n test --force --abi "${target}/${abi}" --package "system-images;android-${apiLevel};${target};${abi}" --device "${device}"`);

  // start emulator
  console.log('Starting emulator.');
  const noWindow = headless ? '-no-window' : '';
  await exec.exec(`bash -c \\"${process.env.ANDROID_HOME}/emulator/emulator -avd test ${noWindow} -no-snapshot -noaudio -no-boot-anim &"`);

  // wait for emulator to complete booting
  await waitForDevice();
  await exec.exec(`${adbPath} shell input keyevent 82`);

  // disable animations
  if (disableAnimations) {
    console.log('Disabling animations.');
    await exec.exec(`${adbPath} shell settings put global window_animation_scale 0.0`);
    await exec.exec(`${adbPath} shell settings put global transition_animation_scale 0.0`);
    await exec.exec(`${adbPath} shell settings put global animator_duration_scale 0.0`);
  }

  // kill emulator
  await exec.exec(`${adbPath} -s emulator-5554 emu kill`);
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
    } catch (e) {
      console.error(e.message);
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
