/**
 * Convert a (potentially multi-line) script to an array of single-line script(s).
 */
export function parseScript(rawScript: string): Array<string> {
  const scripts: Array<string> = rawScript
    .trim()
    .split(/\r\n|\n|\r/)
    .map((value: string) => value.trim())
    .filter((value: string) => {
      return !value.startsWith('#') && value.length > 0;
    });
  return scripts;
}
