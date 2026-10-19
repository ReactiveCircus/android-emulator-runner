import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import { installAndroidSdk } from '../src/sdk-installer';

describe('SDK installation diagnostics', () => {
  const originalEnv = { ...process.env };
  const mkdirP = io.mkdirP;
  const run = exec.exec;
  const getOutput = exec.getExecOutput;
  let tempDir: string;
  let commandLog: string;
  let stdout: string;
  let stderr: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emulator-runner-output-'));
    const sdkRoot = path.join(tempDir, 'android-sdk');
    const binDir = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin');
    fs.mkdirSync(binDir, { recursive: true });
    commandLog = path.join(tempDir, 'commands.log');
    fs.writeFileSync(
      path.join(binDir, 'sdkmanager'),
      `#!/bin/sh
printf '%s\\n' "$*" >> "$EMULATOR_RUNNER_TEST_LOG"
if [ "$1" = '--licenses' ]; then exit 0; fi
printf 'SDK installation progress\\n'
printf 'SDK installation warning\\n' >&2
if [ "$EMULATOR_RUNNER_TEST_FAIL" = '1' ]; then
  case "$*" in
    *'--install emulator'*)
      printf 'Preparing Android Emulator archive\\n'
      printf 'Error on ZipFile unknown archive.\\n' >&2
      exit 27
      ;;
  esac
fi
`,
      { mode: 0o755 },
    );
    process.env.ANDROID_HOME = sdkRoot;
    process.env.EMULATOR_RUNNER_TEST_LOG = commandLog;
    delete process.env.EMULATOR_RUNNER_TEST_FAIL;
    delete process.env.RUNNER_DEBUG;
    process.env.PATH = ['/usr/bin', '/bin'].join(path.delimiter);
    for (const fileCommand of ['GITHUB_PATH', 'GITHUB_ENV']) {
      process.env[fileCommand] = path.join(tempDir, fileCommand);
      fs.writeFileSync(process.env[fileCommand]!, '');
    }
    // Keep the installer from creating an AVD directory in the test user's home.
    jest.spyOn(io, 'mkdirP').mockImplementation(async (dir) => {
      if (dir !== `${process.env.HOME}/.android/avd`) {
        await mkdirP(dir);
      }
    });
    // Child processes need Jest's isolated environment, including the test PATH.
    jest.spyOn(exec, 'exec').mockImplementation((command, args, options) => run(command, args, { ...options, env: process.env as Record<string, string> }));
    jest.spyOn(exec, 'getExecOutput').mockImplementation((command, args, options) => getOutput(command, args, { ...options, env: process.env as Record<string, string> }));
    jest.spyOn(console, 'log').mockImplementation(() => {});
    stdout = '';
    stderr = '';
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdout += chunk.toString();
      return true;
    });
    jest.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      stderr += chunk.toString();
      return true;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const install = () => installAndroidSdk('33', '33', 'google_apis', 'x86_64', 0);

  it('keeps successful installation output quiet while showing warnings', async () => {
    await install();

    expect(stdout).not.toContain('SDK installation progress');
    expect(stdout + stderr).toContain('SDK installation warning');
    expect(fs.readFileSync(commandLog, 'utf8')).not.toContain('--verbose');
  });

  it('prints stdout and stderr for a failed installation without retrying it', async () => {
    process.env.EMULATOR_RUNNER_TEST_FAIL = '1';

    await expect(install()).rejects.toThrow('exit code 27');

    expect(stdout).toContain('Preparing Android Emulator archive');
    expect(stdout + stderr).toContain('Error on ZipFile unknown archive.');
    const commands = fs.readFileSync(commandLog, 'utf8').trim().split('\n');
    expect(commands.filter((command) => command.includes('--install emulator'))).toHaveLength(1);
    expect(commands.some((command) => command.includes('system-images'))).toBe(false);
  });

  it('enables verbose SDK output when Actions debug logging is enabled', async () => {
    process.env.RUNNER_DEBUG = '1';

    await install();

    expect(stdout).toContain('SDK installation progress');
    expect(stdout + stderr).toContain('SDK installation warning');
    const installs = fs
      .readFileSync(commandLog, 'utf8')
      .trim()
      .split('\n')
      .filter((command) => command.includes('--install'));
    expect(installs).toHaveLength(3);
    expect(installs.every((command) => command.includes('--verbose'))).toBe(true);
  });
});
