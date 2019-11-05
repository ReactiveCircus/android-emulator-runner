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
const core = __importStar(require("@actions/core"));
const sdk_installer_1 = require("./sdk-installer");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // only support running on macOS
            if (process.platform !== 'darwin') {
                throw new Error('This action is expected to be run within a macOS virtual machine to enable hardware acceleration.');
            }
            // TODO test inputs
            // TODO test real inputs in test.yml
            // api-level is required
            // TODO use InputOptions {true}
            const apiLevel = core.getInput('api-level');
            // TODO check apiLevel is number and within valid range
            console.log(`API level - ${apiLevel}`);
            // target is optional with default
            const target = core.getInput('target');
            if (target !== 'default' && target !== 'google_apis') {
                throw new Error(`Target ${target} is unknown. Please use either 'default' or 'google_apis'.`);
            }
            console.log(`target - ${target}`);
            // abi is optional with default
            const abi = core.getInput('abi');
            if (abi !== 'x86' && abi !== 'x86_64') {
                throw new Error(`abi ${abi} is unknown (ARM-based emulators are not supported). Please use either 'x86' or 'x86_64'.`);
            }
            console.log(`cpu/abi - ${abi}`);
            // headless is optional with default
            const headless = core.getInput('headless');
            if (headless !== 'true' && headless !== 'false') {
                throw new Error(`Input 'headless' should be either 'true' or 'false'.`);
            }
            console.log(`headless mode - ${headless}`);
            // install SDK
            yield sdk_installer_1.installAndroidSdk(Number(apiLevel), target, abi);
            // TODO start emulator
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
