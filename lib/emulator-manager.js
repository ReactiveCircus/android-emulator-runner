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
const exec = __importStar(require("@actions/exec"));
const EMULATOR_BOOT_TIMEOUT_SECONDS = 300;
const AVD_MANAGER_PATH = `${process.env.ANDROID_HOME}/tools/bin/avdmanager`;
const ADB_PATH = `${process.env.ANDROID_HOME}/platform-tools/adb`;
/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
function launchEmulator(apiLevel, target, arch, profile, emulatorOptions, disableAnimations) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new AVD
        if (profile.trim() !== '') {
            console.log(`Creating AVD with custom profile ${profile}`);
            yield exec.exec(`${AVD_MANAGER_PATH} create avd --force -n test --abi "${target}/${arch}" --package "system-images;android-${apiLevel};${target};${arch}" --device "${profile}"`);
        }
        else {
            console.log(`Creating AVD without custom profile.`);
            yield exec.exec(`sh -c \\"echo no | ${AVD_MANAGER_PATH} create avd --force -n test --abi '${target}/${arch}' --package 'system-images;android-${apiLevel};${target};${arch}'"`);
        }
        // start emulator
        console.log('Starting emulator.');
        yield exec.exec(`sh -c \\"${process.env.ANDROID_HOME}/emulator/emulator -avd test ${emulatorOptions} &"`, [], {
            listeners: {
                stderr: (data) => {
                    if (data.toString().includes('invalid command-line parameter')) {
                        throw new Error(data.toString());
                    }
                }
            }
        });
        // wait for emulator to complete booting
        yield waitForDevice();
        yield exec.exec(`${ADB_PATH} shell input keyevent 82`);
        // disable animations
        if (disableAnimations) {
            console.log('Disabling animations.');
            yield exec.exec(`${ADB_PATH} shell settings put global window_animation_scale 0.0`);
            yield exec.exec(`${ADB_PATH} shell settings put global transition_animation_scale 0.0`);
            yield exec.exec(`${ADB_PATH} shell settings put global animator_duration_scale 0.0`);
        }
    });
}
exports.launchEmulator = launchEmulator;
/**
 * Kills the running emulator on the defaut port.
 */
function killEmulator() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec(`${ADB_PATH} -s emulator-5554 emu kill`);
        }
        catch (error) {
            console.log('No emulator running on port 5554');
        }
    });
}
exports.killEmulator = killEmulator;
/**
 * Wait for emulator to boot.
 */
function waitForDevice() {
    return __awaiter(this, void 0, void 0, function* () {
        const adbPath = `${process.env.ANDROID_HOME}/platform-tools/adb`;
        let booted = false;
        let attempts = 0;
        const retryInterval = 2; // retry every 2 seconds
        const maxAttemps = EMULATOR_BOOT_TIMEOUT_SECONDS / 2;
        while (!booted) {
            try {
                let result = '';
                yield exec.exec(`${adbPath} shell getprop sys.boot_completed`, [], {
                    listeners: {
                        stdout: (data) => {
                            result += data.toString();
                        }
                    }
                });
                if (result.trim() === '1') {
                    console.log('Emulator booted.');
                    booted = true;
                    break;
                }
            }
            catch (error) {
                console.log(error.message);
            }
            if (attempts < maxAttemps) {
                yield delay(retryInterval * 1000);
            }
            else {
                throw new Error(`Timeout waiting for emulator to boot.`);
            }
            attempts++;
        }
    });
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
