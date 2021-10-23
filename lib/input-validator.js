"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmulatorBuild = exports.checkDisableLinuxHardwareAcceleration = exports.checkDisableSpellchecker = exports.checkDisableAnimations = exports.checkForceAvdCreation = exports.checkChannel = exports.checkArch = exports.checkTarget = exports.checkApiLevel = exports.VALID_CHANNELS = exports.VALID_ARCHS = exports.VALID_TARGETS = exports.MIN_API_LEVEL = void 0;
exports.MIN_API_LEVEL = 15;
exports.VALID_TARGETS = ['default', 'google_apis', 'aosp_atd', 'google_atd', 'google_apis_playstore', 'android-wear', 'android-wear-cn', 'android-tv', 'google-tv'];
exports.VALID_ARCHS = ['x86', 'x86_64', 'arm64-v8a'];
exports.VALID_CHANNELS = ['stable', 'beta', 'dev', 'canary'];
function checkApiLevel(apiLevel) {
    if (isNaN(Number(apiLevel)) || !Number.isInteger(Number(apiLevel))) {
        throw new Error(`Unexpected API level: '${apiLevel}'.`);
    }
    if (Number(apiLevel) < exports.MIN_API_LEVEL) {
        throw new Error(`Minimum API level supported is ${exports.MIN_API_LEVEL}.`);
    }
}
exports.checkApiLevel = checkApiLevel;
function checkTarget(target) {
    if (!exports.VALID_TARGETS.includes(target)) {
        throw new Error(`Value for input.target '${target}' is unknown. Supported options: ${exports.VALID_TARGETS}.`);
    }
}
exports.checkTarget = checkTarget;
function checkArch(arch) {
    if (!exports.VALID_ARCHS.includes(arch)) {
        throw new Error(`Value for input.arch '${arch}' is unknown. Supported options: ${exports.VALID_ARCHS}.`);
    }
}
exports.checkArch = checkArch;
function checkChannel(channel) {
    if (!exports.VALID_CHANNELS.includes(channel)) {
        throw new Error(`Value for input.channel '${channel}' is unknown. Supported options: ${exports.VALID_CHANNELS}.`);
    }
}
exports.checkChannel = checkChannel;
function checkForceAvdCreation(forceAvdCreation) {
    if (!isValidBoolean(forceAvdCreation)) {
        throw new Error(`Input for input.force-avd-creation should be either 'true' or 'false'.`);
    }
}
exports.checkForceAvdCreation = checkForceAvdCreation;
function checkDisableAnimations(disableAnimations) {
    if (!isValidBoolean(disableAnimations)) {
        throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
    }
}
exports.checkDisableAnimations = checkDisableAnimations;
function checkDisableSpellchecker(disableSpellchecker) {
    if (!isValidBoolean(disableSpellchecker)) {
        throw new Error(`Input for input.disable-spellchecker should be either 'true' or 'false'.`);
    }
}
exports.checkDisableSpellchecker = checkDisableSpellchecker;
function checkDisableLinuxHardwareAcceleration(disableLinuxHardwareAcceleration) {
    if (!isValidBoolean(disableLinuxHardwareAcceleration)) {
        throw new Error(`Input for input.disable-linux-hw-accel should be either 'true' or 'false'.`);
    }
}
exports.checkDisableLinuxHardwareAcceleration = checkDisableLinuxHardwareAcceleration;
function checkEmulatorBuild(emulatorBuild) {
    if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
        throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
    }
}
exports.checkEmulatorBuild = checkEmulatorBuild;
function isValidBoolean(value) {
    return value === 'true' || value === 'false';
}
