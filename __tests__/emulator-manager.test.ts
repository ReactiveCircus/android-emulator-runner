import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { killEmulator, launchEmulator } from '../src/emulator-manager';

jest.mock('@actions/exec');

const port = 5554;

// Stands in for the emulator: it starts a process in a session of its own that keeps the emulator's output open,
// as crashpad_handler does, then runs until it is killed, whatever adb asks of it.
function fakeEmulator(emulatorPidFile: string, helperPidFile: string): string {
  return `#!/bin/sh
"${process.execPath}" -e "
const helper = require('child_process').spawn('sleep', ['600'], { detached: true, stdio: ['ignore', 'inherit', 'inherit'] });
require('fs').writeFileSync(process.argv[1], String(helper.pid));
helper.unref();
" "${helperPidFile}"
echo $$ > "${emulatorPidFile}"
exec sleep 600
`;
}

describe('emulator manager tests', () => {
  let androidHome: string;
  let emulatorPidFile: string;
  let helperPidFile: string;
  let bootCompleted: string;
  let onEmuKill: () => void;

  beforeEach(() => {
    androidHome = fs.mkdtempSync(path.join(os.tmpdir(), 'android-emulator-runner-'));
    emulatorPidFile = path.join(androidHome, 'emulator.pid');
    helperPidFile = path.join(androidHome, 'helper.pid');
    fs.mkdirSync(path.join(androidHome, 'emulator'));
    fs.writeFileSync(path.join(androidHome, 'emulator', 'emulator'), fakeEmulator(emulatorPidFile, helperPidFile), { mode: 0o755 });
    process.env.ANDROID_HOME = androidHome;
    delete process.env.ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL;
    bootCompleted = '1';
    onEmuKill = () => {};

    jest.mocked(exec.exec).mockImplementation(async (commandLine, _args, options) => {
      if (commandLine.endsWith('shell getprop sys.boot_completed')) {
        await waitForFile(emulatorPidFile);
        options?.listeners?.stdout?.(Buffer.from(bootCompleted));
      }
      if (commandLine.endsWith('emu kill')) {
        onEmuKill();
      }
      return 0;
    });
  });

  afterEach(() => {
    for (const pidFile of [emulatorPidFile, helperPidFile]) {
      if (fs.existsSync(pidFile)) {
        killIfRunning(Number(fs.readFileSync(pidFile, 'utf8')));
      }
    }
    fs.rmSync(androidHome, { recursive: true, force: true });
  });

  it('Waits for the emulator to exit after emu kill, and stops reading the output its leftover processes hold open', async () => {
    const emulator = await launchEmulator('test', false, false, false, 60, '', false, port);
    onEmuKill = () => process.kill(Number(fs.readFileSync(emulatorPidFile, 'utf8')), 'SIGTERM');

    await killEmulator(emulator, port);

    expect(emulator.signalCode).toBe('SIGTERM');
    expect(isRunning(Number(fs.readFileSync(helperPidFile, 'utf8')))).toBe(true);
    expect(emulator.stdout.destroyed).toBe(true);
    expect(emulator.stderr.destroyed).toBe(true);
  });

  it('Kills an emulator still running after its shutdown wait', async () => {
    process.env.ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL = '0';
    const emulator = await launchEmulator('test', false, false, false, 60, '', false, port);

    await killEmulator(emulator, port);

    expect(emulator.signalCode).toBe('SIGKILL');
    expect(isRunning(Number(fs.readFileSync(helperPidFile, 'utf8')))).toBe(true);
    expect(emulator.stdout.destroyed).toBe(true);
    expect(emulator.stderr.destroyed).toBe(true);
  });

  it('Kills the emulator when it does not boot', async () => {
    process.env.ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL = '0';
    bootCompleted = '0';

    await expect(launchEmulator('test', false, false, false, 0, '', false, port)).rejects.toThrow('Timeout waiting for emulator to boot.');

    expect(isRunning(Number(fs.readFileSync(emulatorPidFile, 'utf8')))).toBe(false);
  });
});

async function waitForFile(file: string): Promise<void> {
  while (!fs.existsSync(file)) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killIfRunning(pid: number): void {
  if (isRunning(pid)) {
    process.kill(pid, 'SIGKILL');
  }
}
