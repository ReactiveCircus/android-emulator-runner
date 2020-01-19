import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 * Returns the current $JAVA_HOME path.
 */
export async function getCurrentJavaHome(): Promise<string> {
  let defaultJavaHome = '';
  await exec.exec(`sh -c \\"echo $JAVA_HOME"`, [], {
    listeners: {
      stdout: (data: Buffer) => {
        defaultJavaHome += data.toString();
      }
    }
  });
  return defaultJavaHome.trim();
}

/**
 * Returns the Java 8 $JAVA_HOME path.
 */
export async function getJavaHomeV8(): Promise<string> {
  let javaHomeV8 = '';
  await exec.exec(`/usr/libexec/java_home -v 1.8`, [], {
    listeners: {
      stdout: (data: Buffer) => {
        javaHomeV8 += data.toString();
      }
    }
  });
  return javaHomeV8.trim();
}

/**
 * Sets $JAVA_HOME to the specified path.
 */
export function setJavaHome(path: string) {
  core.exportVariable('JAVA_HOME', path);
}
