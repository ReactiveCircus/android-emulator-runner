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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAndroidSdk = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const BUILD_TOOLS_VERSION = '33.0.2';
// SDK command-line tools 9.0
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-9477386_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip';
/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
function installAndroidSdk(apiLevel, target, arch, channelId, emulatorBuild, ndkVersion, cmakeVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`::group::Install Android SDK`);
            const isOnMac = process.platform === 'darwin';
            if (!isOnMac) {
                yield exec.exec(`sh -c \\"sudo chown $USER:$USER ${process.env.ANDROID_HOME} -R`);
            }
            const cmdlineToolsPath = `${process.env.ANDROID_HOME}/cmdline-tools`;
            if (!fs.existsSync(cmdlineToolsPath)) {
                console.log('Installing new cmdline-tools.');
                const sdkUrl = isOnMac ? CMDLINE_TOOLS_URL_MAC : CMDLINE_TOOLS_URL_LINUX;
                const downloadPath = yield tc.downloadTool(sdkUrl);
                yield tc.extractZip(downloadPath, cmdlineToolsPath);
                yield io.mv(`${cmdlineToolsPath}/cmdline-tools`, `${cmdlineToolsPath}/latest`);
            }
            // add paths for commandline-tools and platform-tools
            core.addPath(`${cmdlineToolsPath}/latest:${cmdlineToolsPath}/latest/bin:${process.env.ANDROID_HOME}/platform-tools`);
            // set standard AVD path
            core.exportVariable('ANDROID_AVD_HOME', `${process.env.HOME}/.android/avd`);
            // accept all Android SDK licenses
            yield exec.exec(`sh -c \\"yes | sdkmanager --licenses > /dev/null"`);
            console.log('Installing latest build tools, platform tools, and platform.');
            yield exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools > /dev/null"`);
            console.log('Installing latest emulator.');
            yield exec.exec(`sh -c \\"sdkmanager --install emulator --channel=${channelId} > /dev/null"`);
            if (emulatorBuild) {
                console.log(`Installing emulator build ${emulatorBuild}.`);
                // TODO find out the correct download URLs for all build ids
                const downloadUrlSuffix = Number(emulatorBuild.charAt(0)) > 6 ? `_x64-${emulatorBuild}` : `-${emulatorBuild}`;
                yield exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}${downloadUrlSuffix}.zip`);
                yield exec.exec(`unzip -o -q emulator.zip -d ${process.env.ANDROID_HOME}`);
                yield io.rmRF('emulator.zip');
            }
            console.log('Installing system images.');
            yield exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${apiLevel};${target};${arch}' --channel=${channelId} > /dev/null"`);
            if (ndkVersion) {
                console.log(`Installing NDK ${ndkVersion}.`);
                yield exec.exec(`sh -c \\"sdkmanager --install 'ndk;${ndkVersion}' --channel=${channelId} > /dev/null"`);
            }
            if (cmakeVersion) {
                console.log(`Installing CMake ${cmakeVersion}.`);
                yield exec.exec(`sh -c \\"sdkmanager --install 'cmake;${cmakeVersion}' --channel=${channelId} > /dev/null"`);
            }
        }
        finally {
            console.log(`::endgroup::`);
        }
    });
}
exports.installAndroidSdk = installAndroidSdk;
