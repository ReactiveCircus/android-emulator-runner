import * as core from '@actions/core';
import { installAndroidSdk } from './sdk-installer';
import { checkApiLevel, checkTarget, checkAbi, checkHeadless, checkDisableAnimations } from './input-validator';
import { launchEmulator } from './emulator-launcher';

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

    // CPU / ABI of the system image
    const abi = core.getInput('abi');
    checkAbi(abi);
    console.log(`cpu/abi: ${abi}`);

    // headless mode
    const headlessInput = core.getInput('headless');
    checkHeadless(headlessInput);
    const headless = headlessInput === 'true';
    console.log(`headless mode: ${headless}`);

    // disable animations
    const disableAnimationsInput = core.getInput('disable-animations');
    checkDisableAnimations(disableAnimationsInput);
    const disableAnimations = disableAnimationsInput === 'true';
    console.log(`disable animations: ${disableAnimations}`);

    // install SDK
    await installAndroidSdk(apiLevel, target, abi);

    // launch emulator
    // TODO get from input (source list of all profiles)
    const device = 'Nexus 6P';
    await launchEmulator(apiLevel, target, abi, device, headless, disableAnimations);

    // TODO start emulator
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
