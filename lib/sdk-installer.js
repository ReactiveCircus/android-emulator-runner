"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const BUILD_TOOLS_VERSION = '30.0.2';
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-6609375_latest.zip';
const CMDLINE_TOOLS_URL_WIN = 'https://dl.google.com/android/repository/commandlinetools-win-6609375_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-6609375_latest.zip';
/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
function installAndroidSdk(apiLevel, target, arch, emulatorBuild, ndkVersion, cmakeVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const IS_MAC = process.platform === 'win32';
        const IS_WINDOWS = process.platform === 'darwin';
        const IS_LINUX = process.platform === 'linux';
        if (IS_LINUX) {
            yield exec.exec(`sh -c \\"sudo chown $USER:$USER ${process.env.ANDROID_HOME} -R`);
        }
        const cmdlineToolsPath = `${process.env.ANDROID_HOME}/cmdline-tools`;
        if (!fs.existsSync(cmdlineToolsPath)) {
            console.log('Installing new cmdline-tools.');
            yield io.mkdirP(`${process.env.ANDROID_HOME}/cmdline-tools`);
            const sdkUrl = IS_MAC ? CMDLINE_TOOLS_URL_MAC : IS_WINDOWS ? CMDLINE_TOOLS_URL_WIN : CMDLINE_TOOLS_URL_LINUX;
            const downloadPath = yield tc.downloadTool(sdkUrl);
            yield tc.extractZip(downloadPath, cmdlineToolsPath);
            // add paths for commandline-tools and platform-tools
            core.addPath(`${cmdlineToolsPath}/tools:${cmdlineToolsPath}/tools/bin:${process.env.ANDROID_HOME}/platform-tools`);
        }
        // additional permission and license requirements for Linux
        const sdkPreviewLicensePath = `${process.env.ANDROID_HOME}/licenses/android-sdk-preview-license`;
        if (IS_LINUX && !fs.existsSync(sdkPreviewLicensePath)) {
            fs.writeFileSync(sdkPreviewLicensePath, '\n84831b9409646a918e30573bab4c9c91346d8abd');
        }
        // license required for API 30 system images
        const sdkArmDbtLicensePath = `${process.env.ANDROID_HOME}/licenses/android-sdk-arm-dbt-license`;
        if (apiLevel == 30 && !fs.existsSync(sdkArmDbtLicensePath)) {
            fs.writeFileSync(sdkArmDbtLicensePath, '\n859f317696f67ef3d7f30a50a5560e7834b43903');
        }
        console.log('Installing latest build tools, platform tools, and platform.');
        const sdkmanagerExec = IS_WINDOWS ? 'sdkmanager.bat' : 'sdkmanagert';
        yield exec.exec(`sh -c \\"${sdkmanagerExec} --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
        if (emulatorBuild) {
            console.log(`Installing emulator build ${emulatorBuild}.`);
            yield io.rmRF(`${process.env.ANDROID_HOME}/emulator`);
            const downloadPath = yield tc.downloadTool(`https://dl.google.com/android/repository/emulator-${IS_MAC ? 'darwin' : IS_WINDOWS ? 'windows' : 'linux'}-${emulatorBuild}.zip`);
            yield tc.extractZip(downloadPath, process.env.ANDROID_HOME);
        }
        else {
            console.log('Installing latest emulator.');
            yield exec.exec(`sh -c \\"${sdkmanagerExec} --install emulator > /dev/null"`);
        }
        console.log('Installing system images.');
        yield exec.exec(`sh -c \\"${sdkmanagerExec} --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
        if (ndkVersion) {
            console.log(`Installing NDK ${ndkVersion}.`);
            yield exec.exec(`sh -c \\"${sdkmanagerExec} --install 'ndk;${ndkVersion}' > /dev/null"`);
        }
        if (cmakeVersion) {
            console.log(`Installing CMake ${cmakeVersion}.`);
            yield exec.exec(`sh -c \\"${sdkmanagerExec} --install 'cmake;${cmakeVersion}' > /dev/null"`);
        }
    });
}
exports.installAndroidSdk = installAndroidSdk;
