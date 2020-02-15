"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const sdk_installer_1 = require("./sdk-installer");
const input_validator_1 = require("./input-validator");
const emulator_manager_1 = require("./emulator-manager");
const exec = __importStar(require("@actions/exec"));
const script_parser_1 = require("./script-parser");
const java_version_manager_1 = require("./java-version-manager");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // only support running on macOS
            if (process.platform !== 'darwin') {
                throw new Error('This action is expected to be run within a macOS virtual machine to enable hardware acceleration.');
            }
            // API level of the platform and system image
            const apiLevelInput = core.getInput('api-level', { required: true });
            input_validator_1.checkApiLevel(apiLevelInput);
            const apiLevel = Number(apiLevelInput);
            console.log(`API level: ${apiLevel}`);
            // target of the system image
            const target = core.getInput('target');
            input_validator_1.checkTarget(target);
            console.log(`target: ${target}`);
            // CPU architecture of the system image
            const arch = core.getInput('arch');
            input_validator_1.checkArch(arch);
            console.log(`CPU architecture: ${arch}`);
            // Hardware profile used for creating the AVD
            const profile = core.getInput('profile');
            console.log(`Hardware profile: ${profile}`);
            // emulator options
            const emulatorOptions = core.getInput('emulator-options').trim();
            console.log(`emulator options: ${emulatorOptions}`);
            // disable animations
            const disableAnimationsInput = core.getInput('disable-animations');
            input_validator_1.checkDisableAnimations(disableAnimationsInput);
            const disableAnimations = disableAnimationsInput === 'true';
            console.log(`disable animations: ${disableAnimations}`);
            // emulator build
            const emulatorBuildInput = core.getInput('emulator-build');
            if (emulatorBuildInput) {
                input_validator_1.checkEmulatorBuild(emulatorBuildInput);
                console.log(`using emulator build: ${emulatorBuildInput}`);
            }
            const emulatorBuild = !emulatorBuildInput ? undefined : emulatorBuildInput;
            // custom working directory
            const workingDirectoryInput = core.getInput('working-directory');
            if (workingDirectoryInput) {
                console.log(`custom working directory: ${workingDirectoryInput}`);
            }
            const workingDirectory = !workingDirectoryInput ? undefined : workingDirectoryInput;
            // custom script to run
            const scriptInput = core.getInput('script', { required: true });
            const scripts = script_parser_1.parseScript(scriptInput);
            console.log(`Script:`);
            scripts.forEach((script) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${script}`);
            }));
            // use Java 8 for sdkmanager and avdmanager
            const defaultJavaHome = yield java_version_manager_1.getCurrentJavaHome();
            java_version_manager_1.setJavaHome(yield java_version_manager_1.getJavaHomeV8());
            // install SDK
            yield sdk_installer_1.installAndroidSdk(apiLevel, target, arch, emulatorBuild);
            try {
                // launch an emulator
                yield emulator_manager_1.launchEmulator(apiLevel, target, arch, profile, emulatorOptions, disableAnimations);
            }
            catch (error) {
                core.setFailed(error.message);
            }
            // use default JAVA_HOME for running custom script
            java_version_manager_1.setJavaHome(defaultJavaHome);
            // execute the custom script
            try {
                // move to custom working directory if set
                if (workingDirectory) {
                    process.chdir(workingDirectory);
                }
                for (const script of scripts) {
                    yield exec.exec(`sh -c \\"${script}"`);
                }
            }
            catch (error) {
                core.setFailed(error.message);
            }
            // finally kill the emulator
            yield emulator_manager_1.killEmulator();
        }
        catch (error) {
            // kill the emulator so the action can exit
            yield emulator_manager_1.killEmulator();
            core.setFailed(error.message);
        }
    });
}
run();
