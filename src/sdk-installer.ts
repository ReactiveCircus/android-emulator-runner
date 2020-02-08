import * as exec from '@actions/exec';

const BUILD_TOOLS_VERSION = '29.0.3';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: number, target: string, arch: string, emulatorBuild?: string): Promise<void> {
  const sdkmanagerPath = `${process.env.ANDROID_HOME}/tools/bin/sdkmanager`;
  console.log('Installing latest build tools, platform tools, and platform.');
  await exec.exec(`sh -c \\"${sdkmanagerPath} --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
  if (emulatorBuild) {
    console.log(`Installing emulator build ${emulatorBuild}.`);
    await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-darwin-${emulatorBuild}.zip`);
    await exec.exec(`rm -rf ${process.env.ANDROID_HOME}/emulator`);
    await exec.exec(`unzip -q emulator.zip -d ${process.env.ANDROID_HOME}`);
    await exec.exec(`rm -f emulator.zip`);
  } else {
    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"${sdkmanagerPath} --install emulator > /dev/null"`);
  }
  console.log('Installing system images.');
  await exec.exec(`sh -c \\"${sdkmanagerPath} --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
}
