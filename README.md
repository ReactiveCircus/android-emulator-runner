# GitHub Action - Android Emulator Runner

<p align="left">
  <a href="https://github.com/ReactiveCircus/android-emulator-runner"><img alt="GitHub Actions status" src="https://github.com/ReactiveCircus/android-emulator-runner/workflows/Main%20workflow/badge.svg"></a>
</p>

A GitHub Action for installing, configuring and running Android Emulators on macOS virtual machines.

TODO

This action must be run on a **macOS** VM, e.g. `macOS-latest` or `macOS-10.14`.

## Configurations

|  | **Required** | **Default** | **Description** |
|----------------------|--------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `api-level` | Required | N/A | API level of the platform system image - e.g. 23 for Android Marshmallow, 29 for Android 10. **Minimum API level supported is 21**. |
| `target` | Optional | `default` | Target of the system image - `default` or `google_apis`. |
| `arch` | Optional | `x86` | CPU architecture of the system image - `x86` or `x86_64`. |
| `profile` | Optional | N/A | Hardware profile used for creating the AVD - e.g. `Nexus 6`. For a list of all profiles available, run `$ANDROID_HOME/tools/bin/avdmanager list` and refer to the results under "Available Android Virtual Devices". |
| `headless` | Optional | `true` | Whether to launch emulator without UI - `true` or `false`. When set to `true` this is equivalent to running the emulator with `emulator -no-window`. |
| `disable-animations` | Optional | `true` | Whether to disable animations - `true` or `false`. |
| `script` | Required | N/A | Custom script to run - e.g. to run Android instrumented tests on the emulator: `./gradlew connectedCheck` |

## Usage

```
TODO
```
