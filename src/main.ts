import * as core from '@actions/core';
import { InputOptions } from '@actions/core/lib/core';
import { installAndroidSdk } from './sdk-installer';
import { checkApiLevel, checkTarget, checkAbi, checkHeadless } from './input-validator';

async function run() {
  try {
    // only support running on macOS
    if (process.platform !== 'darwin') {
      throw new Error('This action is expected to be run within a macOS virtual machine to enable hardware acceleration.');
    }

    // API level of the platform and system image
    const apiLevel = core.getInput('api-level', { required: true } as InputOptions);
    checkApiLevel(apiLevel);
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
    const headless = core.getInput('headless');
    checkHeadless(headless);
    console.log(`headless mode: ${headless}`);

    // install SDK
    await installAndroidSdk(Number(apiLevel), target, abi);

    // TODO start emulator
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
