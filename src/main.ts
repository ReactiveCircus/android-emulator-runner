import * as core from '@actions/core';
import { installAndroidSdk } from './sdk-installer';
import {
  checkApiLevel,
  checkTarget,
  checkArch,
  checkDisableAnimations,
  checkEmulatorBuild,
  checkDisableSpellchecker,
  checkDisableLinuxHardwareAcceleration,
  checkForceAvdCreation,
  checkChannel,
  checkEnableHardwareKeyboard,
  checkDiskSize,
} from './input-validator';
import { launchEmulator, killEmulator } from './emulator-manager';
import * as exec from '@actions/exec';
import { parseScript } from './script-parser';
import { getChannelId } from './channel-id-mapper';
import { accessSync, constants } from 'fs';

async function run() {
  try {
    console.log(`::group::Configure emulator`);
    let linuxSupportKVM = false;
    // only support running on macOS or Linux
    if (process.platform !== 'darwin') {
      if (process.platform === 'linux') {
        try {
          accessSync('/dev/kvm', constants.R_OK | constants.W_OK);
          linuxSupportKVM = true;
        } catch {
          console.warn(
            `You're running a Linux VM where hardware acceleration is not available. Please consider using a macOS VM instead to take advantage of native hardware acceleration support provided by HAXM.`
          );
        }
      } else {
        throw new Error('Unsupported virtual machine: please use either macos or ubuntu VM.');
      }
    }

    // API level of the platform and system image
    const apiLevel = core.getInput('api-level', { required: true });
    checkApiLevel(apiLevel);
    console.log(`API level: ${apiLevel}`);

    // target of the system image
    const targetInput = core.getInput('target');
    const target = targetInput == 'playstore' ? 'google_apis_playstore' : targetInput;
    checkTarget(target);
    console.log(`target: ${target}`);

    // CPU architecture of the system image
    const arch = core.getInput('arch');
    checkArch(arch);
    console.log(`CPU architecture: ${arch}`);

    // Hardware profile used for creating the AVD
    const profile = core.getInput('profile');
    console.log(`Hardware profile: ${profile}`);

    // Number of cores to use for emulator
    const cores = core.getInput('cores');
    console.log(`Cores: ${cores}`);

    // RAM to use for AVD
    const ramSize = core.getInput('ram-size');
    console.log(`RAM size: ${ramSize}`);

    // Heap size to use for AVD
    const heapSize = core.getInput('heap-size');
    console.log(`Heap size: ${heapSize}`);

    // SD card path or size used for creating the AVD
    const sdcardPathOrSize = core.getInput('sdcard-path-or-size');
    console.log(`SD card path or size: ${sdcardPathOrSize}`);

    const diskSize = core.getInput('disk-size');
    checkDiskSize(diskSize);
    console.log(`Disk size: ${diskSize}`);

    // custom name used for creating the AVD
    const avdName = core.getInput('avd-name');
    console.log(`AVD name: ${avdName}`);

    // force AVD creation
    const forceAvdCreationInput = core.getInput('force-avd-creation');
    checkForceAvdCreation(forceAvdCreationInput);
    const forceAvdCreation = forceAvdCreationInput === 'true';
    console.log(`force avd creation: ${forceAvdCreation}`);

    // Emulator boot timeout seconds
    const emulatorBootTimeout = parseInt(core.getInput('emulator-boot-timeout'), 10);
    console.log(`Emulator boot timeout: ${emulatorBootTimeout}`);

    // emulator options
    const emulatorOptions = core.getInput('emulator-options').trim();
    console.log(`emulator options: ${emulatorOptions}`);

    // disable animations
    const disableAnimationsInput = core.getInput('disable-animations');
    checkDisableAnimations(disableAnimationsInput);
    const disableAnimations = disableAnimationsInput === 'true';
    console.log(`disable animations: ${disableAnimations}`);

    // disable spellchecker
    const disableSpellcheckerInput = core.getInput('disable-spellchecker');
    checkDisableSpellchecker(disableSpellcheckerInput);
    const disableSpellchecker = disableSpellcheckerInput === 'true';
    console.log(`disable spellchecker: ${disableSpellchecker}`);

    // disable linux hardware acceleration
    let disableLinuxHardwareAccelerationInput = core.getInput('disable-linux-hw-accel');
    checkDisableLinuxHardwareAcceleration(disableLinuxHardwareAccelerationInput);
    if (disableLinuxHardwareAccelerationInput === 'auto' && process.platform === 'linux') {
      disableLinuxHardwareAccelerationInput = linuxSupportKVM ? 'false' : 'true';
    }
    const disableLinuxHardwareAcceleration = disableLinuxHardwareAccelerationInput === 'true';
    console.log(`disable Linux hardware acceleration: ${disableLinuxHardwareAcceleration}`);

    // enable hardware keyboard
    const enableHardwareKeyboardInput = core.getInput('enable-hw-keyboard');
    checkEnableHardwareKeyboard(enableHardwareKeyboardInput);
    const enableHardwareKeyboard = enableHardwareKeyboardInput === 'true';
    console.log(`enable hardware keyboard: ${enableHardwareKeyboard}`);

    // emulator build
    const emulatorBuildInput = core.getInput('emulator-build');
    if (emulatorBuildInput) {
      checkEmulatorBuild(emulatorBuildInput);
      console.log(`using emulator build: ${emulatorBuildInput}`);
    }
    const emulatorBuild = !emulatorBuildInput ? undefined : emulatorBuildInput;

    // custom working directory
    const workingDirectoryInput = core.getInput('working-directory');
    if (workingDirectoryInput) {
      console.log(`custom working directory: ${workingDirectoryInput}`);
    }
    const workingDirectory = !workingDirectoryInput ? undefined : workingDirectoryInput;

    // version of NDK to install
    const ndkInput = core.getInput('ndk');
    if (ndkInput) {
      console.log(`version of NDK to install: ${ndkInput}`);
    }
    const ndkVersion = !ndkInput ? undefined : ndkInput;

    // version of CMake to install
    const cmakeInput = core.getInput('cmake');
    if (cmakeInput) {
      console.log(`version of CMake to install: ${cmakeInput}`);
    }
    const cmakeVersion = !cmakeInput ? undefined : cmakeInput;

    // channelId (up to and including) to download the SDK packages from
    const channelName = core.getInput('channel');
    checkChannel(channelName);
    const channelId = getChannelId(channelName);
    console.log(`Channel: ${channelId} (${channelName})`);

    // custom script to run
    const scriptInput = core.getInput('script', { required: true });
    const scripts = parseScript(scriptInput);
    console.log(`Script:`);
    scripts.forEach(async (script: string) => {
      console.log(`${script}`);
    });

    // custom pre emulator launch script
    const preEmulatorLaunchScriptInput = core.getInput('pre-emulator-launch-script');
    const preEmulatorLaunchScripts = !preEmulatorLaunchScriptInput ? undefined : parseScript(preEmulatorLaunchScriptInput);
    console.log(`Pre emulator launch script:`);
    preEmulatorLaunchScripts?.forEach(async (script: string) => {
      console.log(`${script}`);
    });
    console.log(`::endgroup::`);

    // install SDK
    await installAndroidSdk(apiLevel, target, arch, channelId, emulatorBuild, ndkVersion, cmakeVersion);

    // execute pre emulator launch script if set
    if (preEmulatorLaunchScripts !== undefined) {
      console.log(`::group::Run pre emulator launch script`);
      try {
        for (const preEmulatorLaunchScript of preEmulatorLaunchScripts) {
          // use array form to avoid various quote escaping problems
          // caused by exec(`sh -c "${preEmulatorLaunchScript}"`)
          await exec.exec('sh', ['-c', preEmulatorLaunchScript], {
            cwd: workingDirectory,
          });
        }
      } catch (error) {
        core.setFailed(error instanceof Error ? error.message : (error as string));
      }
      console.log(`::endgroup::`);
    }

    // launch an emulator
    await launchEmulator(
      apiLevel,
      target,
      arch,
      profile,
      cores,
      ramSize,
      heapSize,
      sdcardPathOrSize,
      diskSize,
      avdName,
      forceAvdCreation,
      emulatorBootTimeout,
      emulatorOptions,
      disableAnimations,
      disableSpellchecker,
      disableLinuxHardwareAcceleration,
      enableHardwareKeyboard
    );

    // execute the custom script
    try {
      // move to custom working directory if set
      if (workingDirectory) {
        process.chdir(workingDirectory);
      }
      for (const script of scripts) {
        // use array form to avoid various quote escaping problems
        // caused by exec(`sh -c "${script}"`)
        await exec.exec('sh', ['-c', script]);
      }
    } catch (error) {
      core.setFailed(error instanceof Error ? error.message : (error as string));
    }

    // finally kill the emulator
    await killEmulator();
  } catch (error) {
    // kill the emulator so the action can exit
    await killEmulator();
    core.setFailed(error instanceof Error ? error.message : (error as string));
  }
}

run();
