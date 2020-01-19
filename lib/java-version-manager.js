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
const exec = __importStar(require("@actions/exec"));
/**
 * Returns the current $JAVA_HOME path.
 */
function getCurrentJavaHome() {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultJavaHome = '';
        yield exec.exec(`sh -c \\"echo $JAVA_HOME"`, [], {
            listeners: {
                stdout: (data) => {
                    defaultJavaHome += data.toString();
                }
            }
        });
        return defaultJavaHome.trim();
    });
}
exports.getCurrentJavaHome = getCurrentJavaHome;
/**
 * Returns the Java 8 $JAVA_HOME path.
 */
function getJavaHomeV8() {
    return __awaiter(this, void 0, void 0, function* () {
        let javaHomeV8 = '';
        yield exec.exec(`/usr/libexec/java_home -v 1.8`, [], {
            listeners: {
                stdout: (data) => {
                    javaHomeV8 += data.toString();
                }
            }
        });
        return javaHomeV8.trim();
    });
}
exports.getJavaHomeV8 = getJavaHomeV8;
/**
 * Sets $JAVA_HOME to the specified path.
 */
function setJavaHome(path) {
    core.exportVariable('JAVA_HOME', path);
}
exports.setJavaHome = setJavaHome;
