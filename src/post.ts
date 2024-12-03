import * as core from '@actions/core';
import { checkPort, MIN_PORT } from './input-validator';
import { killEmulator } from './emulator-manager';
import * as exec from '@actions/exec';

async function post() {
  let port: number = MIN_PORT;
  // Emulator port to use
  port = parseInt(core.getInput('emulator-port'), 10);
  checkPort(port);
  console.log(`emulator port: ${port}`);
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
      console.log('Emulator online, killing it.');
      await killEmulator(port);
    }
  } catch (error) {
    await killEmulator(port);
    console.warn(error instanceof Error ? error.message : error);
  }
}

post();
