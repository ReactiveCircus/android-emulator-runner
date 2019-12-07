"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_API_LEVEL = 21;
exports.VALID_TARGETS = ['default', 'google_apis'];
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
    if (disableAnimations !== 'true' && disableAnimations !== 'false') {
        throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
    }
}
exports.checkDisableAnimations = checkDisableAnimations;
