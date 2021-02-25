import * as exec from '@actions/exec';

const EMULATOR_BOOT_TIMEOUT_SECONDS = 600;
let ENABLE_LOGCAT = false;

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
  emulatorOptions: string,
  disableAnimations: boolean,
  disableSpellChecker: boolean,
  disableAutofill: boolean,
  longPressTimeout: number,
  enableHwKeyboard: boolean,
  enableLogcat: boolean
): Promise<void> {
  // create a new AVD
  const profileOption = profile.trim() !== '' ? `--device '${profile}'` : '';
  const sdcardPathOrSizeOption = sdcardPathOrSize.trim() !== '' ? `--sdcard '${sdcardPathOrSize}'` : '';
  console.log(`Creating AVD.`);
  await exec.exec(
    `sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --abi '${target}/${arch}' --package 'system-images;android-${apiLevel};${target};${arch}' ${profileOption} ${sdcardPathOrSizeOption}"`
  );

  if (cores) {
    await exec.exec(`sh -c \\"printf 'hw.cpu.ncore=${cores}\n' >> ~/.android/avd/"${avdName}".avd"/config.ini`);
  }

  if (ramSize) {
    await exec.exec(`sh -c \\"printf 'hw.ramSize=${ramSize}\n' >> ~/.android/avd/"${avdName}".avd"/config.ini`);
  }

  if (enableHwKeyboard) {
    await exec.exec(`sh -c \\"printf 'hw.keyboard=yes\n' >> ~/.android/avd/"${avdName}".avd"/config.ini`);
  }

  // start emulator
  console.log('Starting emulator.');

  // turn off hardware acceleration on Linux
  if (process.platform === 'linux') {
    emulatorOptions += ' -accel off';
  }

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
  if (disableAutofill) {
    await exec.exec(`adb shell settings put secure autofill_service null`);
  }
  if (longPressTimeout) {
    await exec.exec(`adb shell settings put secure long_press_timeout ${longPressTimeout}`);
  }
  if (enableHwKeyboard) {
    await exec.exec(`adb shell settings put secure show_ime_with_hard_keyboard 0`);
  }

  if (enableLogcat) {
    ENABLE_LOGCAT = enableLogcat;
    await startLogcat();
  }
}

/**
 * Kills the running emulator on the defaut port.
 */
export async function killEmulator(): Promise<void> {
  try {
    if (ENABLE_LOGCAT) {
      await stopLogcat();
    }
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
  const maxAttemps = EMULATOR_BOOT_TIMEOUT_SECONDS / 2;
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

async function startLogcat(): Promise<void> {
  console.log('Starting logcat read process');
  await exec.exec(`mkdir -p artifacts`);
  try {
    await exec.exec(`sh -c \\"adb logcat -v time > artifacts/logcat.log &"`);
  } catch (error) {
    console.log(error.message);
  }
}

async function stopLogcat(): Promise<void> {
  console.log('Stopping logcat read process');
  await exec.exec(`sh -c "jobs -p | xargs kill"`);
}
