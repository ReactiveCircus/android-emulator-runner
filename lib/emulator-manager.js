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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAvd = createAvd;
exports.launchEmulator = launchEmulator;
exports.killEmulator = killEmulator;
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
/**
 * Creates a new AVD instance with the specified configurations.
 */
async function createAvd(arch, avdName, cores, diskSize, enableHardwareKeyboard, forceAvdCreation, heapSize, profile, ramSize, sdcardPathOrSize, systemImageApiLevel, target) {
    try {
        console.log(`::group::Create AVD`);
        // create a new AVD if AVD directory does not already exist or forceAvdCreation is true
        const avdPath = `${process.env.ANDROID_AVD_HOME}/${avdName}.avd`;
        if (!fs.existsSync(avdPath) || forceAvdCreation) {
            const profileOption = profile.trim() !== '' ? `--device '${profile}'` : '';
            const sdcardPathOrSizeOption = sdcardPathOrSize.trim() !== '' ? `--sdcard '${sdcardPathOrSize}'` : '';
            console.log(`Creating AVD.`);
            await exec.exec(`sh -c \\"echo no | avdmanager create avd --force -n "${avdName}" --package 'system-images;android-${systemImageApiLevel};${target};${arch}' ${profileOption} ${sdcardPathOrSizeOption}"`);
        }
        if (cores || ramSize || heapSize || enableHardwareKeyboard || diskSize) {
            const configEntries = [];
            if (cores) {
                configEntries.push(`hw.cpu.ncore=${cores}`);
            }
            if (ramSize) {
                configEntries.push(`hw.ramSize=${ramSize}`);
            }
            if (heapSize) {
                configEntries.push(`hw.heapSize=${heapSize}`);
            }
            if (enableHardwareKeyboard) {
                configEntries.push('hw.keyboard=yes');
            }
            if (diskSize) {
                configEntries.push(`disk.dataPartition.size=${diskSize}`);
            }
            if (configEntries.length > 0) {
                const configContent = configEntries.join('\\n') + '\\n';
                await exec.exec(`sh -c \\"printf '${configContent}' >> ${process.env.ANDROID_AVD_HOME}/"${avdName}".avd"/config.ini"`);
            }
        }
    }
    finally {
        console.log(`::endgroup::`);
    }
}
/**
 * Launches an existing AVD instance with the specified configurations.
 */
async function launchEmulator(avdName, disableAnimations, disableLinuxHardwareAcceleration, disableSpellChecker, emulatorBootTimeout, emulatorOptions, enableHardwareKeyboard, port) {
    try {
        console.log(`::group::Launch Emulator`);
        // turn off hardware acceleration on Linux
        if (process.platform === 'linux' && disableLinuxHardwareAcceleration) {
            console.log('Disabling Linux hardware acceleration.');
            emulatorOptions += ' -accel off';
        }
        // start emulator
        console.log('Starting emulator.');
        await exec.exec(`sh -c \\"${process.env.ANDROID_HOME}/emulator/emulator -port ${port} -avd "${avdName}" ${emulatorOptions} &"`, [], {
            listeners: {
                stderr: (data) => {
                    if (data.toString().includes('invalid command-line parameter')) {
                        throw new Error(data.toString());
                    }
                },
            },
        });
        // wait for emulator to complete booting
        await waitForDevice(port, emulatorBootTimeout);
        await adb(port, `shell input keyevent 82`);
        if (disableAnimations) {
            console.log('Disabling animations.');
            await adb(port, `shell settings put global window_animation_scale 0.0`);
            await adb(port, `shell settings put global transition_animation_scale 0.0`);
            await adb(port, `shell settings put global animator_duration_scale 0.0`);
        }
        if (disableSpellChecker) {
            await adb(port, `shell settings put secure spell_checker_enabled 0`);
        }
        if (enableHardwareKeyboard) {
            await adb(port, `shell settings put secure show_ime_with_hard_keyboard 0`);
        }
    }
    finally {
        console.log(`::endgroup::`);
    }
}
/**
 * Kills the running emulator on the default port.
 */
async function killEmulator(port) {
    try {
        console.log(`::group::Terminate Emulator`);
        await adb(port, `emu kill`);
    }
    catch (error) {
        console.log(error instanceof Error ? error.message : error);
    }
    finally {
        console.log(`::endgroup::`);
    }
}
async function adb(port, command) {
    return await exec.exec(`adb -s emulator-${port} ${command}`);
}
/**
 * Wait for emulator to boot.
 */
async function waitForDevice(port, emulatorBootTimeout) {
    let booted = false;
    let attempts = 0;
    const retryInterval = 2; // retry every 2 seconds
    const maxAttempts = emulatorBootTimeout / 2;
    while (!booted) {
        try {
            let result = '';
            await exec.exec(`adb -s emulator-${port} shell getprop sys.boot_completed`, [], {
                listeners: {
                    stdout: (data) => {
                        result += data.toString();
                    },
                },
            });
            if (result.trim() === '1') {
                console.log('Emulator booted.');
                booted = true;
                break;
            }
        }
        catch (error) {
            console.warn(error instanceof Error ? error.message : error);
        }
        if (attempts < maxAttempts) {
            await delay(retryInterval * 1000);
        }
        else {
            throw new Error(`Timeout waiting for emulator to boot.`);
        }
        attempts++;
    }
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
