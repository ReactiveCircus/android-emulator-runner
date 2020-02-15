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
const BUILD_TOOLS_VERSION = '29.0.3';
/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
function installAndroidSdk(apiLevel, target, arch, emulatorBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        const sdkmanagerPath = `${process.env.ANDROID_HOME}/tools/bin/sdkmanager`;
        console.log('Installing latest build tools, platform tools, and platform.');
        yield exec.exec(`sh -c \\"${sdkmanagerPath} --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}' > /dev/null"`);
        if (emulatorBuild) {
            console.log(`Installing emulator build ${emulatorBuild}.`);
            yield exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-darwin-${emulatorBuild}.zip`);
            yield exec.exec(`rm -rf ${process.env.ANDROID_HOME}/emulator`);
            yield exec.exec(`unzip -q emulator.zip -d ${process.env.ANDROID_HOME}`);
            yield exec.exec(`rm -f emulator.zip`);
        }
        else {
            console.log('Installing latest emulator.');
            yield exec.exec(`sh -c \\"${sdkmanagerPath} --install emulator > /dev/null"`);
        }
        console.log('Installing system images.');
        yield exec.exec(`sh -c \\"${sdkmanagerPath} --install 'system-images;android-${apiLevel};${target};${arch}' > /dev/null"`);
    });
}
exports.installAndroidSdk = installAndroidSdk;
