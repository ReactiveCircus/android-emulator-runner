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
const EMULATOR_BOOT_TIMEOUT_SECONDS = 120;
/**
 * Creates and launches a new AVD instance with the specified configurations.
 */
function launchEmulator(apiLevel, target, abi, device, headless, disableAnimations) {
    return __awaiter(this, void 0, void 0, function* () {
        const avdmangerPath = `${process.env.ANDROID_HOME}/tools/bin/avdmanager`;
        const adbPath = `${process.env.ANDROID_HOME}/platform-tools/adb`;
        // create a new AVD
        console.log('Creating AVD.');
        yield exec.exec(`${avdmangerPath} create avd -n test --force --abi "${target}/${abi}" --package "system-images;android-${apiLevel};${target};${abi}" --device "${device}"`);
        // start emulator
        console.log('Starting emulator.');
        const noWindow = headless ? '-no-window' : '';
        yield exec.exec(`bash -c \\"${process.env.ANDROID_HOME}/emulator/emulator -avd test ${noWindow} -no-snapshot -noaudio -no-boot-anim &"`);
        // wait for emulator to complete booting
        yield waitForDevice();
        yield exec.exec(`${adbPath} shell input keyevent 82`);
        // disable animations
        if (disableAnimations) {
            console.log('Disabling animations.');
            yield exec.exec(`${adbPath} shell settings put global window_animation_scale 0.0`);
            yield exec.exec(`${adbPath} shell settings put global transition_animation_scale 0.0`);
            yield exec.exec(`${adbPath} shell settings put global animator_duration_scale 0.0`);
        }
        // kill emulator
        yield exec.exec(`${adbPath} -s emulator-5554 emu kill`);
    });
}
exports.launchEmulator = launchEmulator;
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
            catch (e) {
                console.error(e.message);
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
