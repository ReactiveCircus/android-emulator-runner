export const MIN_API_LEVEL = 15;
export const VALID_TARGETS: Array<string> = ['default', 'google_apis'];
export const VALID_ARCHS: Array<string> = ['x86', 'x86_64', 'armeabi-v7a', 'arm64-v8a'];
export const VALID_ARCHS_FOR_LINUX: Array<string> = ['armeabi-v7a', 'arm64-v8a'];

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

export function checkArch(arch: string, isOnLinux: boolean): void {
  if (!VALID_ARCHS.includes(arch)) {
    throw new Error(`Value for input.arch '${arch}' is unknown. Supported options: ${VALID_ARCHS}.`);
  }
  if (isOnLinux && !VALID_ARCHS_FOR_LINUX.includes(arch)) {
    throw new Error(`Only one of ARM-based system images (${VALID_ARCHS_FOR_LINUX}) are supported when running on a Linux VM.`);
  }
}

export function checkDisableAnimations(disableAnimations: string): void {
  if (disableAnimations !== 'true' && disableAnimations !== 'false') {
    throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
  }
}

export function checkEmulatorBuild(emulatorBuild: string): void {
  if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
    throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
  }
}
