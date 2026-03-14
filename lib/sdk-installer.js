"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAndroidSdk = installAndroidSdk;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const BUILD_TOOLS_VERSION = '36.0.0';
// SDK command-line tools 20.0
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-14742923_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-14742923_latest.zip';
/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
async function installAndroidSdk(apiLevel, systemImageApiLevel, target, arch, channelId, emulatorBuild, ndkVersion, cmakeVersion) {
    try {
        console.log(`::group::Install Android SDK`);
        const isOnMac = process.platform === 'darwin';
        const isArm = process.arch === 'arm64';
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
        await io.mkdirP(`${process.env.HOME}/.android/avd`);
        core.exportVariable('ANDROID_AVD_HOME', `${process.env.HOME}/.android/avd`);
        // accept all Android SDK licenses
        await exec.exec(`sh -c \\"yes | sdkmanager --licenses > /dev/null"`);
        console.log('Installing latest build tools, platform tools, and platform.');
        await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}'> /dev/null"`);
        console.log('Installing latest emulator.');
        await exec.exec(`sh -c \\"sdkmanager --install emulator --channel=${channelId} > /dev/null"`);
        if (emulatorBuild) {
            console.log(`Installing emulator build ${emulatorBuild}.`);
            // TODO find out the correct download URLs for all build ids
            var downloadUrlSuffix;
            const majorBuildVersion = Number(emulatorBuild);
            if (majorBuildVersion >= 8000000) {
                if (isArm) {
                    downloadUrlSuffix = `_aarch64-${emulatorBuild}`;
                }
                else {
                    downloadUrlSuffix = `_x64-${emulatorBuild}`;
                }
            }
            else if (majorBuildVersion >= 7000000) {
                downloadUrlSuffix = `_x64-${emulatorBuild}`;
            }
            else {
                downloadUrlSuffix = `-${emulatorBuild}`;
            }
            await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}${downloadUrlSuffix}.zip`);
            await exec.exec(`unzip -o -q emulator.zip -d ${process.env.ANDROID_HOME}`);
            await io.rmRF('emulator.zip');
        }
        console.log('Installing system images.');
        await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${systemImageApiLevel};${target};${arch}' --channel=${channelId} > /dev/null"`);
        if (ndkVersion) {
            console.log(`Installing NDK ${ndkVersion}.`);
            await exec.exec(`sh -c \\"sdkmanager --install 'ndk;${ndkVersion}' --channel=${channelId} > /dev/null"`);
        }
        if (cmakeVersion) {
            console.log(`Installing CMake ${cmakeVersion}.`);
            await exec.exec(`sh -c \\"sdkmanager --install 'cmake;${cmakeVersion}' --channel=${channelId} > /dev/null"`);
        }
    }
    finally {
        console.log(`::endgroup::`);
    }
}
