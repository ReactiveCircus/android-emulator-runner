"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_API_LEVEL = 21;
exports.VALID_TARGETS = ['default', 'google_apis'];
exports.VALID_ABIS = ['x86', 'x86_64'];
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
function checkAbi(abi) {
    if (!exports.VALID_ABIS.includes(abi)) {
        throw new Error(`Value for input.abi '${abi}' is unknown. Supported options: ${exports.VALID_ABIS}.`);
    }
}
exports.checkAbi = checkAbi;
function checkHeadless(headless) {
    if (headless !== 'true' && headless !== 'false') {
        throw new Error(`Input for input.headless should be either 'true' or 'false'.`);
    }
}
exports.checkHeadless = checkHeadless;
