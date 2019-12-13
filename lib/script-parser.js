"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    if (scripts.length == 0) {
        throw new Error(`No valid script found.`);
    }
    return scripts;
}
exports.parseScript = parseScript;
