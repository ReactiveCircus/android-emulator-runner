"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScript = void 0;
/**
 * Convert a (potentially multi-line) script to an array of single-line script(s).
 */
function parseScript(rawScript) {
    const scripts = rawScript
        .trim()
        .split(/\r\n|\n|\r/)
        .map((value) => value.trim())
        .filter((value) => {
        return !value.startsWith('#') && value.length > 0;
    });
    return scripts;
}
exports.parseScript = parseScript;
