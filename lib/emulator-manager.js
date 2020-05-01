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
const EMULATOR_BOOT_TIMEOUT_SECONDS = 600;
/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
function launchEmulator(apiLevel, target, arch, profile, avdName, emulatorOptions, disableAnimations) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new AVD
        if (profile.trim() !== '') {
            console.log(`Creating AVD with custom profile ${profile}`);
            yield exec.exec(`avdmanager create avd --force -n "${avdName}" --abi "${target}/${arch}" --package "system-images;android-${apiLevel};${target};${arch}" --device "${profile}"`);
        }
        else {
            console.log(`Creating AVD without custom profile.`);
            yield exec.exec(`sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --abi '${target}/${arch}' --package 'system-images;android-${apiLevel};${target};${arch}'"`);
        }
        // start emulator
        console.log('Starting emulator.');
        // turn off hardware acceleration on Linux
        if (process.platform === 'linux') {
            emulatorOptions += ' -accel off';
        }
        yield exec.exec(`sh -c \\"${process.env.ANDROID_HOME}/emulator/emulator -avd "${avdName}" ${emulatorOptions} &"`, [], {
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
        yield exec.exec(`adb shell input keyevent 82`);
        // disable animations
        if (disableAnimations) {
            console.log('Disabling animations.');
            yield exec.exec(`adb shell settings put global window_animation_scale 0.0`);
            yield exec.exec(`adb shell settings put global transition_animation_scale 0.0`);
            yield exec.exec(`adb shell settings put global animator_duration_scale 0.0`);
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
            yield exec.exec(`adb -s emulator-5554 emu kill`);
        }
        catch (error) {
            console.log(error.message);
        }
    });
}
exports.killEmulator = killEmulator;
/**
 * Wait for emulator to boot.
 */
function waitForDevice() {
    return __awaiter(this, void 0, void 0, function* () {
        let booted = false;
        let attempts = 0;
        const retryInterval = 2; // retry every 2 seconds
        const maxAttemps = EMULATOR_BOOT_TIMEOUT_SECONDS / 2;
        while (!booted) {
            try {
                let result = '';
                yield exec.exec(`adb shell getprop sys.boot_completed`, [], {
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
                console.warn(error.message);
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
