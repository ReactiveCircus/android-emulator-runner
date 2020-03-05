import * as core from '@actions/core';
import * as exec from '@actions/exec';

const BUILD_TOOLS_VERSION = '29.0.3';
const CMDLINE_TOOLS_URL = 'https://dl.google.com/android/repository/commandlinetools-linux-6200805_latest.zip';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: number, target: string, arch: string, emulatorBuild?: string): Promise<void> {
  console.log('Installing new cmdline-tools.');
  await exec.exec(`mkdir ${process.env.ANDROID_HOME}/cmdline-tools`);
  await exec.exec(`curl -fo commandlinetools.zip ${CMDLINE_TOOLS_URL}`);
  await exec.exec(`unzip -q commandlinetools.zip -d ${process.env.ANDROID_HOME}/cmdline-tools`);
  await exec.exec(`rm -f commandlinetools.zip`);

  // add paths for commandline-tools and platform-tools
  core.addPath(`${process.env.ANDROID_HOME}/cmdline-tools/tools:${process.env.ANDROID_HOME}/cmdline-tools/tools/bin:${process.env.ANDROID_HOME}/platform-tools`);

  console.log('Installing latest build tools, platform tools, and platform.');
  await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
  if (emulatorBuild) {
    console.log(`Installing emulator build ${emulatorBuild}.`);
    await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-darwin-${emulatorBuild}.zip`);
    await exec.exec(`rm -rf ${process.env.ANDROID_HOME}/emulator`);
    await exec.exec(`unzip -q emulator.zip -d ${process.env.ANDROID_HOME}`);
    await exec.exec(`rm -f emulator.zip`);
  } else {
    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"sdkmanager --install emulator > /dev/null"`);
  }
  console.log('Installing system images.');
  await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
}
