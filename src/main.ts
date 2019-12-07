import * as core from '@actions/core';
import { installAndroidSdk } from './sdk-installer';
import { checkApiLevel, checkTarget, checkArch, checkDisableAnimations } from './input-validator';
import { launchEmulator, killEmulator } from './emulator-manager';
import * as exec from '@actions/exec';

async function run() {
  try {
    // only support running on macOS
    if (process.platform !== 'darwin') {
      throw new Error('This action is expected to be run within a macOS virtual machine to enable hardware acceleration.');
    }

    // API level of the platform and system image
    const apiLevelInput = core.getInput('api-level', { required: true });
    checkApiLevel(apiLevelInput);
    const apiLevel = Number(apiLevelInput);
    console.log(`API level: ${apiLevel}`);

    // target of the system image
    const target = core.getInput('target');
    checkTarget(target);
    console.log(`target: ${target}`);

    // CPU architecture of the system image
    const arch = core.getInput('arch');
    checkArch(arch);
    console.log(`CPI architecture: ${arch}`);

    // Hardware profile used for creating the AVD
    const profile = core.getInput('profile');
    console.log(`Hardware profile: ${profile}`);

    // emulator options
    const emulatorOptions = core.getInput('emulator-options').trim();
    console.log(`emulator options: ${emulatorOptions}`);

    // disable animations
    const disableAnimationsInput = core.getInput('disable-animations');
    checkDisableAnimations(disableAnimationsInput);
    const disableAnimations = disableAnimationsInput === 'true';
    console.log(`disable animations: ${disableAnimations}`);

    // custom scrpt to run
    const script = core.getInput('script', { required: true });

    try {
      // install SDK
      await installAndroidSdk(apiLevel, target, arch);

      // launch an emulator
      await launchEmulator(apiLevel, target, arch, profile, emulatorOptions, disableAnimations);

      // execute the custom script
      await exec.exec(`${script}`);
    } catch (error) {
      core.setFailed(error.message);
    }

    // finally kill the emulator
    await killEmulator();
  } catch (error) {
    // kill the emulator so the action can exit
    await killEmulator();
    core.setFailed(error.message);
  }
}

run();
