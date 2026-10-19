import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import { installAndroidSdk } from '../src/sdk-installer';

jest.mock('@actions/tool-cache');

describe('SDK command-line tools selection', () => {
  const originalEnv = { ...process.env };
  const mkdirP = io.mkdirP;
  const run = exec.exec;
  let tempDir: string;
  let sdkRoot: string;
  let commandLog: string;

  function writeTools(binDir: string, label: string): void {
    fs.mkdirSync(binDir, { recursive: true });
    for (const tool of ['sdkmanager', 'avdmanager']) {
      fs.writeFileSync(path.join(binDir, tool), `#!/bin/sh\nprintf '%s\\n' '${label}:${tool}' >> "$EMULATOR_RUNNER_TEST_LOG"\n`, { mode: 0o755 });
    }
  }

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emulator-runner-sdk-'));
    sdkRoot = path.join(tempDir, 'android-sdk');
    commandLog = path.join(tempDir, 'commands.log');
    process.env.ANDROID_HOME = sdkRoot;
    process.env.EMULATOR_RUNNER_TEST_LOG = commandLog;
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
    jest.mocked(tc.downloadTool).mockRejectedValue(new Error('Unexpected SDK download'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  async function expectSelectedTools(label: string, binDir: string): Promise<void> {
    await installAndroidSdk('33', '33', 'google_apis', 'x86_64', 0);
    const commands = fs.readFileSync(commandLog, 'utf8').trim().split('\n');
    expect(commands).toHaveLength(4);
    expect(commands.every((command) => command === `${label}:sdkmanager`)).toBe(true);
    expect(await io.which('avdmanager', true)).toBe(path.join(binDir, 'avdmanager'));
  }

  it('keeps the versioned SDK tools selected by an earlier setup step', async () => {
    const selectedBin = path.join(sdkRoot, 'cmdline-tools', '22.0', 'bin');
    const preinstalledBin = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin');
    writeTools(selectedBin, 'selected');
    writeTools(preinstalledBin, 'preinstalled');
    process.env.PATH = [selectedBin, preinstalledBin, process.env.PATH].join(path.delimiter);

    await expectSelectedTools('selected', selectedBin);
    expect(tc.downloadTool).not.toHaveBeenCalled();
  });

  it('uses SDK tools on PATH without requiring a cmdline-tools/latest directory', async () => {
    const selectedBin = path.join(tempDir, 'selected-tools', 'bin');
    writeTools(selectedBin, 'selected');
    process.env.PATH = [selectedBin, process.env.PATH].join(path.delimiter);

    await expectSelectedTools('selected', selectedBin);
    expect(tc.downloadTool).not.toHaveBeenCalled();
  });

  it('adds preinstalled tools to PATH when no sdkmanager is selected', async () => {
    const preinstalledBin = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin');
    writeTools(preinstalledBin, 'preinstalled');

    await expectSelectedTools('preinstalled', preinstalledBin);
    expect(tc.downloadTool).not.toHaveBeenCalled();
  });

  it('falls back to preinstalled tools when PATH only contains sdkmanager', async () => {
    const selectedBin = path.join(tempDir, 'incomplete-tools', 'bin');
    const preinstalledBin = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin');
    writeTools(selectedBin, 'incomplete');
    fs.unlinkSync(path.join(selectedBin, 'avdmanager'));
    writeTools(preinstalledBin, 'preinstalled');
    process.env.PATH = [selectedBin, process.env.PATH].join(path.delimiter);

    await expectSelectedTools('preinstalled', preinstalledBin);
    expect(tc.downloadTool).not.toHaveBeenCalled();
  });

  it('downloads the bundled tools when none are installed or on PATH', async () => {
    jest.mocked(tc.downloadTool).mockResolvedValue(path.join(tempDir, 'tools.zip'));
    jest.mocked(tc.extractZip).mockImplementation(async (_archive, destination) => {
      writeTools(path.join(destination!, 'cmdline-tools', 'bin'), 'downloaded');
      return destination!;
    });

    await expectSelectedTools('downloaded', path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin'));
    expect(tc.downloadTool).toHaveBeenCalledTimes(1);
  });
});
