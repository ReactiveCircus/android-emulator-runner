"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDiskSize = exports.checkEmulatorBuild = exports.checkCleanupAvd = exports.checkEnableHardwareKeyboard = exports.checkDisableLinuxHardwareAcceleration = exports.checkDisableSpellchecker = exports.checkDisableAnimations = exports.checkPort = exports.checkForceAvdCreation = exports.checkChannel = exports.checkArch = exports.playstoreTargetSubstitution = exports.MAX_PORT = exports.MIN_PORT = exports.VALID_CHANNELS = exports.VALID_ARCHS = exports.MIN_API_LEVEL = void 0;
exports.MIN_API_LEVEL = 15;
exports.VALID_ARCHS = ['x86', 'x86_64', 'arm64-v8a'];
exports.VALID_CHANNELS = ['stable', 'beta', 'dev', 'canary'];
exports.MIN_PORT = 5554;
exports.MAX_PORT = 5584;
function playstoreTargetSubstitution(target) {
    // "playstore" is an allowed shorthand for "google_apis_playstore" images
    // this is idempotent - return same even if run multiple times on same target
    if (target === 'playstore')
        return 'google_apis_playstore';
    if (target === 'playstore_ps16k')
        return 'google_apis_playstore_ps16k';
    return target;
}
exports.playstoreTargetSubstitution = playstoreTargetSubstitution;
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
function checkPort(port) {
    if (port < exports.MIN_PORT || port > exports.MAX_PORT) {
        throw new Error(`Emulator port is outside of the supported port range [${exports.MIN_PORT}, ${exports.MAX_PORT}], was ${port}`);
    }
    if (port % 2 == 1) {
        throw new Error(`Emulator port has to be even, was ${port}`);
    }
}
exports.checkPort = checkPort;
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
    if (!(isValidBoolean(disableLinuxHardwareAcceleration) || disableLinuxHardwareAcceleration === 'auto')) {
        throw new Error(`Input for input.disable-linux-hw-accel should be either 'true' or 'false' or 'auto'.`);
    }
}
exports.checkDisableLinuxHardwareAcceleration = checkDisableLinuxHardwareAcceleration;
function checkEnableHardwareKeyboard(enableHardwareKeyboard) {
    if (!isValidBoolean(enableHardwareKeyboard)) {
        throw new Error(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
    }
}
exports.checkEnableHardwareKeyboard = checkEnableHardwareKeyboard;
function checkCleanupAvd(cleanupAvd) {
    if (!isValidBoolean(cleanupAvd)) {
        throw new Error(`Input for input.cleanup-avd should be either 'true' or 'false'.`);
    }
}
exports.checkCleanupAvd = checkCleanupAvd;
function checkEmulatorBuild(emulatorBuild) {
    if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
        throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
    }
}
exports.checkEmulatorBuild = checkEmulatorBuild;
function isValidBoolean(value) {
    return value === 'true' || value === 'false';
}
function checkDiskSize(diskSize) {
    // Disk size can be empty - the default value
    if (diskSize) {
        // Can also be number of bytes
        if (isNaN(Number(diskSize)) || !Number.isInteger(Number(diskSize))) {
            // Disk size can have a size multiplier at the end K, M or G
            const diskSizeUpperCase = diskSize.toUpperCase();
            if (diskSizeUpperCase.endsWith('K') || diskSizeUpperCase.endsWith('M') || diskSizeUpperCase.endsWith('G')) {
                const diskSizeNoModifier = diskSize.slice(0, -1);
                if (0 == diskSizeNoModifier.length || isNaN(Number(diskSizeNoModifier)) || !Number.isInteger(Number(diskSizeNoModifier))) {
                    throw new Error(`Unexpected disk size: '${diskSize}'.`);
                }
            }
        }
    }
}
exports.checkDiskSize = checkDiskSize;
