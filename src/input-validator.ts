export const MIN_API_LEVEL = 21;
export const VALID_TARGETS: Array<string> = ['default', 'google_apis'];
export const VALID_ABIS: Array<string> = ['x86', 'x86_64'];

export function checkApiLevel(apiLevel: string): void {
  if (isNaN(Number(apiLevel)) || !Number.isInteger(Number(apiLevel))) {
    throw new Error(`Unexpected API level: '${apiLevel}'.`);
  }
  if (Number(apiLevel) < MIN_API_LEVEL) {
    throw new Error(`Minimum API level supported is ${MIN_API_LEVEL}.`);
  }
}

export function checkTarget(target: string): void {
  if (!VALID_TARGETS.includes(target)) {
    throw new Error(`Value for input.target '${target}' is unknown. Supported options: ${VALID_TARGETS}.`);
  }
}

export function checkAbi(abi: string): void {
  if (!VALID_ABIS.includes(abi)) {
    throw new Error(`Value for input.abi '${abi}' is unknown. Supported options: ${VALID_ABIS}.`);
  }
}

export function checkHeadless(headless: string): void {
  if (headless !== 'true' && headless !== 'false') {
    throw new Error(`Input for input.headless should be either 'true' or 'false'.`);
  }
}

export function checkDisableAnimations(disableAnimations: string): void {
  if (disableAnimations !== 'true' && disableAnimations !== 'false') {
    throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
  }
}
