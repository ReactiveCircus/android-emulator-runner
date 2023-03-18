export const MIN_API_LEVEL = 15;
export const VALID_TARGETS: Array<string> = ['default', 'google_apis', 'aosp_atd', 'google_atd', 'google_apis_playstore', 'android-wear', 'android-wear-cn', 'android-tv', 'google-tv'];
export const VALID_ARCHS: Array<string> = ['x86', 'x86_64', 'arm64-v8a'];
export const VALID_CHANNELS: Array<string> = ['stable', 'beta', 'dev', 'canary'];

export function checkApiLevel(apiLevel: string): void {
  if (apiLevel.startsWith('UpsideDownCake') || apiLevel === 'TiramisuPrivacySandbox') return;
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

export function checkArch(arch: string): void {
  if (!VALID_ARCHS.includes(arch)) {
    throw new Error(`Value for input.arch '${arch}' is unknown. Supported options: ${VALID_ARCHS}.`);
  }
}

export function checkChannel(channel: string): void {
  if (!VALID_CHANNELS.includes(channel)) {
    throw new Error(`Value for input.channel '${channel}' is unknown. Supported options: ${VALID_CHANNELS}.`);
  }
}

export function checkForceAvdCreation(forceAvdCreation: string): void {
  if (!isValidBoolean(forceAvdCreation)) {
    throw new Error(`Input for input.force-avd-creation should be either 'true' or 'false'.`);
  }
}

export function checkDisableAnimations(disableAnimations: string): void {
  if (!isValidBoolean(disableAnimations)) {
    throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
  }
}

export function checkDisableSpellchecker(disableSpellchecker: string): void {
  if (!isValidBoolean(disableSpellchecker)) {
    throw new Error(`Input for input.disable-spellchecker should be either 'true' or 'false'.`);
  }
}

export function checkDisableLinuxHardwareAcceleration(disableLinuxHardwareAcceleration: string): void {
  if (!(isValidBoolean(disableLinuxHardwareAcceleration) || disableLinuxHardwareAcceleration === 'auto')) {
    throw new Error(`Input for input.disable-linux-hw-accel should be either 'true' or 'false' or 'auto'.`);
  }
}

export function checkEnableHardwareKeyboard(enableHardwareKeyboard: string): void {
  if (!isValidBoolean(enableHardwareKeyboard)) {
    throw new Error(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
  }
}

export function checkEmulatorBuild(emulatorBuild: string): void {
  if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
    throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
  }
}

function isValidBoolean(value: string): boolean {
  return value === 'true' || value === 'false';
}

export function checkDiskSize(diskSize: string): void {
  // Disk size can be empty - the default value
  if (diskSize) {
    // Can also be number of bytes
    if (isNaN(Number(diskSize)) || !Number.isInteger(Number(diskSize))) {
      // Disk size can have a size multiplier at the end K, M or G
      const diskSizeUpperCase = diskSize.toUpperCase();
      if (diskSizeUpperCase.endsWith('K') || diskSizeUpperCase.endsWith('M') || diskSizeUpperCase.endsWith('G')) {
        const diskSizeNoModifier: string = diskSize.slice(0, -1);
        if (0 == diskSizeNoModifier.length || isNaN(Number(diskSizeNoModifier)) || !Number.isInteger(Number(diskSizeNoModifier))) {
          throw new Error(`Unexpected disk size: '${diskSize}'.`);
        }
      }
    }
  }
}
