"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec = __importStar(require("@actions/exec"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const BUILD_TOOLS_VERSION = '29.0.2';
const SDK_URL = 'https://dl.google.com/android/repository/sdk-tools-darwin-4333796.zip';
/**
 * Downloads and installs the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, cpu/abi, and target.
 */
function installAndroidSdk(apiLevel, abi, target) {
    return __awaiter(this, void 0, void 0, function* () {
        // download Android SDK if not already installed
        if (fs.existsSync(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager`)) {
            console.log('Android SDK already installed.');
        }
        else {
            console.log('Downloading Android SDK.');
            const downloadedSdkPath = yield tc.downloadTool(SDK_URL);
            yield tc.extractZip(downloadedSdkPath, process.env.ANDROID_HOME);
        }
        // install specific SDK tools
        console.log('Installing build tools, platform tools, platform and system image.');
        yield exec.exec(`yes | ${process.env.ANDROID_HOME}/tools/bin/sdkmanager --licenses`);
        yield exec.exec(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager --update`);
        yield exec.exec(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager "build-tools;${BUILD_TOOLS_VERSION}"`);
        yield exec.exec(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager "platform-tools"`);
        yield exec.exec(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager "platforms;android-${apiLevel}"`);
        yield exec.exec(`${process.env.ANDROID_HOME}/tools/bin/sdkmanager "system-images;android-${apiLevel};${target};${abi}"`);
    });
}
exports.installAndroidSdk = installAndroidSdk;
