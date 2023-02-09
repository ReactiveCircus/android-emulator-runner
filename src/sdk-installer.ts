import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';

const BUILD_TOOLS_VERSION = '33.0.0';
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-9123335_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-9123335_latest.zip';

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(apiLevel: string, target: string, arch: string, channelId: number, emulatorBuild?: string, ndkVersion?: string, cmakeVersion?: string): Promise<void> {
  try {
    console.log(`::group::Install Android SDK`);
    const isOnMac = process.platform === 'darwin';

    if (!isOnMac) {
      await exec.exec(`sh -c \\"sudo chown $USER:$USER ${process.env.ANDROID_HOME} -R`);
    }

    const cmdlineToolsPath = `${process.env.ANDROID_HOME}/cmdline-tools`;
    if (!fs.existsSync(cmdlineToolsPath)) {
      console.log('Installing new cmdline-tools.');
      const sdkUrl = isOnMac ? CMDLINE_TOOLS_URL_MAC : CMDLINE_TOOLS_URL_LINUX;
      const downloadPath = await tc.downloadTool(sdkUrl);
      await tc.extractZip(downloadPath, cmdlineToolsPath);
      await io.mv(`${cmdlineToolsPath}/cmdline-tools`, `${cmdlineToolsPath}/latest`);
    }

    // add paths for commandline-tools and platform-tools
    core.addPath(`${cmdlineToolsPath}/latest:${cmdlineToolsPath}/latest/bin:${process.env.ANDROID_HOME}/platform-tools`);

    // set standard AVD path
    core.exportVariable('ANDROID_AVD_HOME', `${process.env.HOME}/.android/avd`);

    // accept all Android SDK licenses
    await exec.exec(`sh -c \\"yes | sdkmanager --licenses > /dev/null"`);

    console.log('Installing latest build tools, platform tools, and platform.');

    await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools > /dev/null"`);

    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"sdkmanager --install emulator --channel=${channelId} > /dev/null"`);

    if (emulatorBuild) {
      console.log(`Installing emulator build ${emulatorBuild}.`);
      // TODO find out the correct download URLs for all build ids
      const downloadUrlSuffix = Number(emulatorBuild.charAt(0)) > 6 ? `_x64-${emulatorBuild}` : `-${emulatorBuild}`;
      await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}${downloadUrlSuffix}.zip`);
      await exec.exec(`unzip -o -q emulator.zip -d ${process.env.ANDROID_HOME}`);
      await io.rmRF('emulator.zip');
    }
    console.log('Installing system images.');
    await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${apiLevel};${target};${arch}' --channel=${channelId} > /dev/null"`);

    if (ndkVersion) {
      console.log(`Installing NDK ${ndkVersion}.`);
      await exec.exec(`sh -c \\"sdkmanager --install 'ndk;${ndkVersion}' --channel=${channelId} > /dev/null"`);
    }
    if (cmakeVersion) {
      console.log(`Installing CMake ${cmakeVersion}.`);
      await exec.exec(`sh -c \\"sdkmanager --install 'cmake;${cmakeVersion}' --channel=${channelId} > /dev/null"`);
    }
  } finally {
    console.log(`::endgroup::`);
  }
}
