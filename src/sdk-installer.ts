import * as exec from '@actions/exec';

const BUILD_TOOLS_VERSION = '29.0.2';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: number, target: string, arch: string): Promise<void> {
  const sdkmangerPath = `${process.env.ANDROID_HOME}/tools/bin/sdkmanager`;
  console.log('Installing latest build tools, platform tools, platform, and emulator.');
  await exec.exec(`bash -c \\"${sdkmangerPath} --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' emulator > /dev/null"`);
  console.log('Installing system images.');
  await exec.exec(`bash -c \\"${sdkmangerPath} --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
}
