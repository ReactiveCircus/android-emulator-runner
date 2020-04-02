import * as core from '@actions/core';
import * as exec from '@actions/exec';

const BUILD_TOOLS_VERSION = '29.0.3';
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-6200805_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-6200805_latest.zip';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: number, target: string, arch: string, emulatorBuild?: string): Promise<void> {
  const isOnMac = process.platform === 'darwin';
  console.log('Installing new cmdline-tools.');
  const sdkUrl = isOnMac ? CMDLINE_TOOLS_URL_MAC : CMDLINE_TOOLS_URL_LINUX;
  await exec.exec(`sudo mkdir ${process.env.ANDROID_HOME}/cmdline-tools`);
  await exec.exec(`curl -fo commandlinetools.zip ${sdkUrl}`);
  await exec.exec(`sudo unzip -q commandlinetools.zip -d ${process.env.ANDROID_HOME}/cmdline-tools`);
  await exec.exec(`sudo rm -f commandlinetools.zip`);

  // add paths for commandline-tools and platform-tools
  core.addPath(`${process.env.ANDROID_HOME}/cmdline-tools/tools:${process.env.ANDROID_HOME}/cmdline-tools/tools/bin:${process.env.ANDROID_HOME}/platform-tools`);

  // additional permission and license requirements for Linux
  if (!isOnMac) {
    await exec.exec(`sh -c \\"sudo chmod -R 777 ${process.env.ANDROID_HOME}"`);
    await exec.exec(`sh -c \\"echo -e '\n84831b9409646a918e30573bab4c9c91346d8abd' > ${process.env.ANDROID_HOME}/licenses/android-sdk-preview-license"`);
  }

  console.log('Installing latest build tools, platform tools, and platform.');

  await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
  if (emulatorBuild) {
    console.log(`Installing emulator build ${emulatorBuild}.`);
    await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}-${emulatorBuild}.zip`);
    await exec.exec(`sudo rm -rf ${process.env.ANDROID_HOME}/emulator`);
    await exec.exec(`sudo unzip -q emulator.zip -d ${process.env.ANDROID_HOME}`);
    await exec.exec(`sudo rm -f emulator.zip`);
  } else {
    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"sdkmanager --install emulator > /dev/null"`);
  }
  console.log('Installing system images.');
  await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
}
