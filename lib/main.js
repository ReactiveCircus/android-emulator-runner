"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const sdk_installer_1 = require("./sdk-installer");
const input_validator_1 = require("./input-validator");
const emulator_manager_1 = require("./emulator-manager");
const exec = __importStar(require("@actions/exec"));
const script_parser_1 = require("./script-parser");
const channel_id_mapper_1 = require("./channel-id-mapper");
const fs_1 = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`::group::Configure emulator`);
            let linuxSupportKVM = false;
            // only support running on macOS or Linux
            if (process.platform !== 'darwin') {
                if (process.platform === 'linux') {
                    try {
                        (0, fs_1.accessSync)('/dev/kvm', fs_1.constants.R_OK | fs_1.constants.W_OK);
                        linuxSupportKVM = true;
                    }
                    catch (_a) {
                        console.warn(`You're running a Linux VM where hardware acceleration is not available. Please consider using a macOS VM instead to take advantage of native hardware acceleration support provided by HAXM.`);
                    }
                }
                else {
                    throw new Error('Unsupported virtual machine: please use either macos or ubuntu VM.');
                }
            }
            // API level of the platform and system image
            const apiLevel = core.getInput('api-level', { required: true });
            (0, input_validator_1.checkApiLevel)(apiLevel);
            console.log(`API level: ${apiLevel}`);
            // target of the system image
            const targetInput = core.getInput('target');
            const target = targetInput == 'playstore' ? 'google_apis_playstore' : targetInput;
            (0, input_validator_1.checkTarget)(target);
            console.log(`target: ${target}`);
            // CPU architecture of the system image
            const arch = core.getInput('arch');
            (0, input_validator_1.checkArch)(arch);
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
            (0, input_validator_1.checkDiskSize)(diskSize);
            console.log(`Disk size: ${diskSize}`);
            // custom name used for creating the AVD
            const avdName = core.getInput('avd-name');
            console.log(`AVD name: ${avdName}`);
            // force AVD creation
            const forceAvdCreationInput = core.getInput('force-avd-creation');
            (0, input_validator_1.checkForceAvdCreation)(forceAvdCreationInput);
            const forceAvdCreation = forceAvdCreationInput === 'true';
            console.log(`force avd creation: ${forceAvdCreation}`);
            // emulator options
            const emulatorOptions = core.getInput('emulator-options').trim();
            console.log(`emulator options: ${emulatorOptions}`);
            // disable animations
            const disableAnimationsInput = core.getInput('disable-animations');
            (0, input_validator_1.checkDisableAnimations)(disableAnimationsInput);
            const disableAnimations = disableAnimationsInput === 'true';
            console.log(`disable animations: ${disableAnimations}`);
            // disable spellchecker
            const disableSpellcheckerInput = core.getInput('disable-spellchecker');
            (0, input_validator_1.checkDisableSpellchecker)(disableSpellcheckerInput);
            const disableSpellchecker = disableSpellcheckerInput === 'true';
            console.log(`disable spellchecker: ${disableSpellchecker}`);
            // disable linux hardware acceleration
            let disableLinuxHardwareAccelerationInput = core.getInput('disable-linux-hw-accel');
            (0, input_validator_1.checkDisableLinuxHardwareAcceleration)(disableLinuxHardwareAccelerationInput);
            if (disableLinuxHardwareAccelerationInput === 'auto' && process.platform === 'linux') {
                disableLinuxHardwareAccelerationInput = linuxSupportKVM ? 'false' : 'true';
            }
            const disableLinuxHardwareAcceleration = disableLinuxHardwareAccelerationInput === 'true';
            console.log(`disable Linux hardware acceleration: ${disableLinuxHardwareAcceleration}`);
            // enable hardware keyboard
            const enableHardwareKeyboardInput = core.getInput('enable-hw-keyboard');
            (0, input_validator_1.checkEnableHardwareKeyboard)(enableHardwareKeyboardInput);
            const enableHardwareKeyboard = enableHardwareKeyboardInput === 'true';
            console.log(`enable hardware keyboard: ${enableHardwareKeyboard}`);
            // emulator build
            const emulatorBuildInput = core.getInput('emulator-build');
            if (emulatorBuildInput) {
                (0, input_validator_1.checkEmulatorBuild)(emulatorBuildInput);
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
            (0, input_validator_1.checkChannel)(channelName);
            const channelId = (0, channel_id_mapper_1.getChannelId)(channelName);
            console.log(`Channel: ${channelId} (${channelName})`);
            // custom script to run
            const scriptInput = core.getInput('script', { required: true });
            const scripts = (0, script_parser_1.parseScript)(scriptInput);
            console.log(`Script:`);
            scripts.forEach((script) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${script}`);
            }));
            // custom pre emulator launch script
            const preEmulatorLaunchScriptInput = core.getInput('pre-emulator-launch-script');
            const preEmulatorLaunchScripts = !preEmulatorLaunchScriptInput ? undefined : (0, script_parser_1.parseScript)(preEmulatorLaunchScriptInput);
            console.log(`Pre emulator launch script:`);
            preEmulatorLaunchScripts === null || preEmulatorLaunchScripts === void 0 ? void 0 : preEmulatorLaunchScripts.forEach((script) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${script}`);
            }));
            console.log(`::endgroup::`);
            // install SDK
            yield (0, sdk_installer_1.installAndroidSdk)(apiLevel, target, arch, channelId, emulatorBuild, ndkVersion, cmakeVersion);
            // execute pre emulator launch script if set
            if (preEmulatorLaunchScripts !== undefined) {
                console.log(`::group::Run pre emulator launch script`);
                try {
                    for (const preEmulatorLaunchScript of preEmulatorLaunchScripts) {
                        // use array form to avoid various quote escaping problems
                        // caused by exec(`sh -c "${preEmulatorLaunchScript}"`)
                        yield exec.exec('sh', ['-c', preEmulatorLaunchScript], {
                            cwd: workingDirectory,
                        });
                    }
                }
                catch (error) {
                    core.setFailed(error instanceof Error ? error.message : error);
                }
                console.log(`::endgroup::`);
            }
            // launch an emulator
            yield (0, emulator_manager_1.launchEmulator)(apiLevel, target, arch, profile, cores, ramSize, heapSize, sdcardPathOrSize, diskSize, avdName, forceAvdCreation, emulatorOptions, disableAnimations, disableSpellchecker, disableLinuxHardwareAcceleration, enableHardwareKeyboard);
            // execute the custom script
            try {
                // move to custom working directory if set
                if (workingDirectory) {
                    process.chdir(workingDirectory);
                }
                for (const script of scripts) {
                    // use array form to avoid various quote escaping problems
                    // caused by exec(`sh -c "${script}"`)
                    yield exec.exec('sh', ['-c', script]);
                }
            }
            catch (error) {
                core.setFailed(error instanceof Error ? error.message : error);
            }
            // finally kill the emulator
            yield (0, emulator_manager_1.killEmulator)();
        }
        catch (error) {
            // kill the emulator so the action can exit
            yield (0, emulator_manager_1.killEmulator)();
            core.setFailed(error instanceof Error ? error.message : error);
        }
    });
}
run();
