import * as core from '@actions/core';
import { installAndroidSdk } from './sdk-installer'

async function run() {
  try {
    // only support running on macOS
    if (process.platform !== 'darwin') {
      throw new Error('This action is expected to be run within a macOS virtual machine to enable hardware acceleration.');
    }

    // TODO test inputs
    // TODO test real inputs in test.yml

    // api-level is required
    // TODO use InputOptions {true}
    const apiLevel = core.getInput('api-level');
    // TODO check apiLevel is number and within valid range
    console.log(`API level: ${apiLevel}`);

    // target is optional with default
    const target = core.getInput('target');
    if (target !== 'default' && target !== 'google_apis') {
      throw new Error(`Target ${target} is unknown. Please use either 'default' or 'google_apis'.`);
    }
    console.log(`target: ${target}`);

    // abi is optional with default
    const abi = core.getInput('abi');
    if (abi !== 'x86' && abi !== 'x86_64') {
      throw new Error(`abi ${abi} is unknown (ARM-based emulators are not supported). Please use either 'x86' or 'x86_64'.`);
    }
    console.log(`cpu/abi: ${abi}`);

    // headless is optional with default
    const headless = core.getInput('headless');
    if (headless !== 'true' && headless !== 'false') {
      throw new Error(`Input 'headless' should be either 'true' or 'false'.`);
    }
    console.log(`headless mode: ${headless}`);

    // install SDK
    await installAndroidSdk(Number(apiLevel), target, abi);

    // TODO start emulator
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
