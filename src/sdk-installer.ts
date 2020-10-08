import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as fs from 'fs';

const BUILD_TOOLS_VERSION = '30.0.2';
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-6609375_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-6609375_latest.zip';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: number, target: string, arch: string, emulatorBuild?: string, ndkVersion?: string, cmakeVersion?: string): Promise<void> {
  const isOnMac = process.platform === 'darwin';

  if (!isOnMac) {
    await exec.exec(`sh -c \\"sudo chown $USER:$USER ${process.env.ANDROID_HOME} -R`);
  }

  const cmdlineToolsPath = `${process.env.ANDROID_HOME}/cmdline-tools`;
  if (!fs.existsSync(cmdlineToolsPath)) {
    console.log('Installing new cmdline-tools.');
    const sdkUrl = isOnMac ? CMDLINE_TOOLS_URL_MAC : CMDLINE_TOOLS_URL_LINUX;
    await io.mkdirP(`${process.env.ANDROID_HOME}/cmdline-tools`);
    await exec.exec(`curl -fo commandlinetools.zip ${sdkUrl}`);
    await exec.exec(`unzip -q commandlinetools.zip -d ${cmdlineToolsPath}`);
    await io.rmRF('commandlinetools.zip');

    // add paths for commandline-tools and platform-tools
    core.addPath(`${cmdlineToolsPath}/tools:${cmdlineToolsPath}/tools/bin:${process.env.ANDROID_HOME}/platform-tools`);
  }

  // additional permission and license requirements for Linux
  const sdkPreviewLicensePath = `${process.env.ANDROID_HOME}/licenses/android-sdk-preview-license`;
  if (!isOnMac && !fs.existsSync(sdkPreviewLicensePath)) {
    fs.writeFileSync(sdkPreviewLicensePath, '\n84831b9409646a918e30573bab4c9c91346d8abd');
  }

  // license required for API 30 system images
  const sdkArmDbtLicensePath = `${process.env.ANDROID_HOME}/licenses/android-sdk-arm-dbt-license`;
  if (apiLevel == 30 && !fs.existsSync(sdkArmDbtLicensePath)) {
    fs.writeFileSync(sdkArmDbtLicensePath, '\n859f317696f67ef3d7f30a50a5560e7834b43903');
  }

  console.log('Installing latest build tools, platform tools, and platform.');

  await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
  if (emulatorBuild) {
    console.log(`Installing emulator build ${emulatorBuild}.`);
    await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}-${emulatorBuild}.zip`);
    await io.rmRF(`${process.env.ANDROID_HOME}/emulator`);
    await exec.exec(`unzip -q emulator.zip -d ${process.env.ANDROID_HOME}`);
    await io.rmRF('emulator.zip');
  } else {
    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"sdkmanager --install emulator > /dev/null"`);
  }
  console.log('Installing system images.');
  await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);

  if (ndkVersion) {
    console.log(`Installing NDK ${ndkVersion}.`);
    await exec.exec(`sh -c \\"sdkmanager --install 'ndk;${ndkVersion}' > /dev/null"`);
  }
  if (cmakeVersion) {
    console.log(`Installing CMake ${cmakeVersion}.`);
    await exec.exec(`sh -c \\"sdkmanager --install 'cmake;${cmakeVersion}' > /dev/null"`);
  }
}
