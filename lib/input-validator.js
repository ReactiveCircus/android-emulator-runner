"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmulatorBuild = exports.checkLongPressTimeout = exports.checkEnableLogcat = exports.checkEnableHwKeyboard = exports.checkDisableAutofill = exports.checkDisableSpellchecker = exports.checkDisableAnimations = exports.checkArch = exports.checkTarget = exports.checkApiLevel = exports.VALID_ARCHS = exports.VALID_TARGETS = exports.MIN_API_LEVEL = void 0;
exports.MIN_API_LEVEL = 15;
exports.VALID_TARGETS = ['default', 'google_apis', 'google_apis_playstore'];
exports.VALID_ARCHS = ['x86', 'x86_64'];
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
function checkDisableAutofill(disableAutofill) {
    if (!isValidBoolean(disableAutofill)) {
        throw new Error(`Input for input.disable-autofill should be either 'true' or 'false'.`);
    }
}
exports.checkDisableAutofill = checkDisableAutofill;
function checkEnableHwKeyboard(enableHwKeyboard) {
    if (!isValidBoolean(enableHwKeyboard)) {
        throw new Error(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
    }
}
exports.checkEnableHwKeyboard = checkEnableHwKeyboard;
function checkEnableLogcat(enableLogcat) {
    if (!isValidBoolean(enableLogcat)) {
        throw new Error(`Input for input.enable-logcat should be either 'true' or 'false'.`);
    }
}
exports.checkEnableLogcat = checkEnableLogcat;
function checkLongPressTimeout(timeout) {
    if (isNaN(Number(timeout)) || !Number.isInteger(Number(timeout))) {
        throw new Error(`Unexpected longpress-timeout: '${timeout}'.`);
    }
}
exports.checkLongPressTimeout = checkLongPressTimeout;
function checkEmulatorBuild(emulatorBuild) {
    if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
        throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
    }
}
exports.checkEmulatorBuild = checkEmulatorBuild;
function isValidBoolean(value) {
    return value === 'true' || value === 'false';
}
