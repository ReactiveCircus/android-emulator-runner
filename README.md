# GitHub Action - Android Emulator Runner

<p align="left">
  <a href="https://github.com/ReactiveCircus/android-emulator-runner"><img alt="GitHub Actions status" src="https://github.com/ReactiveCircus/android-emulator-runner/workflows/Main%20workflow/badge.svg"></a>
</p>

A GitHub Action for installing, configuring and running Android Emulators on macOS virtual machines.

The old ARM-based emulators were slow and are no longer supported by Google. The modern Intel Atom (x86 and x86_64) emulators require hardware acceleration (HAXM on Mac & Windows, QEMU on Linux) from the host to run fast. This presents a challenge on CI as to be able to run hardware accelerated emulators within a docker container, **KVM** must be supported by the host VM which isn't the case for cloud-based CI providers due to infrastructural limits. If you want to learn more about this, here's an article I wrote: [Running Android Instrumented Tests on CI](https://dev.to/ychescale9/running-android-emulators-on-ci-from-bitrise-io-to-github-actions-3j76).

The **masOS** VM provided by **GitHub Actions** has **HAXM** installed so we are able to create a new AVD instance, launch an emulator with hardware acceleration, and run our Android 
tests directly on the VM.

This action automates the process by doing the following:

- Install / update the required **Android SDK** components including `build-tools`, `platform-tools`, `platform` (for the required API level), `emulator` and `system-images` (for the required API level).
- Create a new instance of **AVD** with the provided [configurations](#configurations).
- Launch a new Emulator with the provided [configurations](#configurations).
- Wait until the Emulator is booted and ready for use.
- Run a custom script provided by user once the Emulator is up and running - e.g. `./gradlew connectedCheck`.
- Kill the Emulator and finish the action.

## Usage

Note that this action must be run on a **macOS** VM, e.g. `macOS-latest` or `macOS-10.14`.

A workflow that uses **android-emulator-runner** to run your instrumented tests on **API 29**:

```
jobs:
  test:
    runs-on: macOS-latest
    steps:
    - name: checkout
      uses: actions/checkout@v1
      with:
        fetch-depth: 1

    - name: run tests
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: 29
        script: ./gradlew connectedCheck
```

We can also leverage GitHub Actions's build matrix to test across multiple configurations:

```
jobs:
  test:
    runs-on: macOS-latest
    strategy:
      matrix:
        api-level: [21, 23, 29]
        target: [default, google_apis]
    steps:
    - name: checkout
      uses: actions/checkout@v1
      with:
        fetch-depth: 1

    - name: run tests
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: ${{ matrix.api-level }}
        target: ${{ matrix.target }}
        arch: x86_64
        profile: Nexus 6
        script: ./gradlew connectedCheck
```

## Configurations

|  | **Required** | **Default** | **Description** |
|----------------------|--------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `api-level` | Required | N/A | API level of the platform system image - e.g. 23 for Android Marshmallow, 29 for Android 10. **Minimum API level supported is 21**. |
| `target` | Optional | `default` | Target of the system image - `default` or `google_apis`. |
| `arch` | Optional | `x86` | CPU architecture of the system image - `x86` or `x86_64`. |
| `profile` | Optional | N/A | Hardware profile used for creating the AVD - e.g. `Nexus 6`. For a list of all profiles available, run `$ANDROID_HOME/tools/bin/avdmanager list` and refer to the results under "Available Android Virtual Devices". |
| `emulator-options` | Optional | See below | Command-line options used when launching the emulator (replacing all default options) - e.g. `-no-window -no-snapshot -camera-back emulated`. |
| `disable-animations` | Optional | `true` | Whether to disable animations - `true` or `false`. |
| `emulator-build` | Optional | N/A | Build number of a specific version of the emulator binary to use e.g. `6061023` for emulator v29.3.0.0. |
| `script` | Required | N/A | Custom script to run - e.g. to run Android instrumented tests on the emulator: `./gradlew connectedCheck` |

Default `emulator-options`: `-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim`.
