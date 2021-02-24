# GitHub Action - Android Emulator Runner

<p align="left">
  <a href="https://github.com/ReactiveCircus/android-emulator-runner"><img alt="GitHub Actions status" src="https://github.com/ReactiveCircus/android-emulator-runner/workflows/Main%20workflow/badge.svg"></a>
</p>

A GitHub Action for installing, configuring and running hardware-accelerated Android Emulators on macOS virtual machines.

The old ARM-based emulators were slow and are no longer supported by Google. The modern Intel Atom (x86 and x86_64) emulators require hardware acceleration (HAXM on Mac & Windows, QEMU on Linux) from the host to run fast. This presents a challenge on CI as to be able to run hardware accelerated emulators within a docker container, **KVM** must be supported by the host VM which isn't the case for cloud-based CI providers due to infrastructural limits. If you want to learn more about this, here's an article I wrote: [Running Android Instrumented Tests on CI](https://dev.to/ychescale9/running-android-emulators-on-ci-from-bitrise-io-to-github-actions-3j76).

The **macOS** VM provided by **GitHub Actions** has **HAXM** installed so we are able to create a new AVD instance, launch an emulator with hardware acceleration, and run our Android 
tests directly on the VM.

This action automates the process by doing the following:

- Install / update the required **Android SDK** components including `build-tools`, `platform-tools`, `platform` (for the required API level), `emulator` and `system-images` (for the required API level).
- Create a new instance of **AVD** with the provided [configurations](#configurations).
- Launch a new Emulator with the provided [configurations](#configurations).
- Wait until the Emulator is booted and ready for use.
- Run a custom script provided by user once the Emulator is up and running - e.g. `./gradlew connectedCheck`.
- Kill the Emulator and finish the action.

## Usage

It is recommended to run this action on a **macOS** VM, e.g. `macos-latest` or `macos-10.15` to take advantage of hardware accleration support provided by **HAXM**.

A workflow that uses **android-emulator-runner** to run your instrumented tests on **API 29**:

```
jobs:
  test:
    runs-on: macos-latest
    steps:
    - name: checkout
      uses: actions/checkout@v2

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
    runs-on: macos-latest
    strategy:
      matrix:
        api-level: [21, 23, 29]
        target: [default, google_apis]
    steps:
    - name: checkout
      uses: actions/checkout@v2

    - name: run tests
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: ${{ matrix.api-level }}
        target: ${{ matrix.target }}
        arch: x86_64
        profile: Nexus 6
        script: ./gradlew connectedCheck
```

If you need specific versions of **NDK** and **CMake** installed:

```
jobs:
  test:
    runs-on: macos-latest
    steps:
    - name: checkout
      uses: actions/checkout@v2

    - name: run tests
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: 29
        ndk: 21.0.6113669
        cmake: 3.10.2.4988404
        script: ./gradlew connectedCheck
```

## Configurations

| **Input** | **Required** | **Default** | **Description** |
|-|-|-|-|
| `api-level` | Required | N/A | API level of the platform system image - e.g. 23 for Android Marshmallow, 29 for Android 10. **Minimum API level supported is 15**. |
| `target` | Optional | `default` | Target of the system image - `default`, `google_apis` or `playstore`. |
| `arch` | Optional | `x86` | CPU architecture of the system image - `x86` or `x86_64`. Note that `x86_64` image is only available for API 21+. |
| `profile` | Optional | N/A | Hardware profile used for creating the AVD - e.g. `Nexus 6`. For a list of all profiles available, run `avdmanager list` and refer to the results under "Available Android Virtual Devices". |
| `cores` | Optional | N/A | Number of cores to use for the emulator (`hw.cpu.ncore` in config.ini). |
| `sdcard-path-or-size` | Optional | N/A | Path to the SD card image for this AVD or the size of a new SD card image to create for this AVD, in KB or MB, denoted with K or M. - e.g. `path/to/sdcard`, or `1000M`. |
| `avd-name` | Optional | `test` | Custom AVD name used for creating the Android Virtual Device. |
| `emulator-options` | Optional | See below | Command-line options used when launching the emulator (replacing all default options) - e.g. `-no-window -no-snapshot -camera-back emulated`. |
| `disable-animations` | Optional | `true` | Whether to disable animations - `true` or `false`. |
| `disable-spellchecker` | Optional | `false` | Whether to disable spellchecker - `true` or `false`. |
| `disable-autofill` | Optional | `false` | Whether to disable autofill - `true` or `false`. |
| `longpress-timeout` | Optional | 500 | Longpress timeout in milliseconds. |
| `enable-hw-keyboard` | Optional | `false` | Whether to enable the hw keyboard and disable soft keyboard - `true` or `false`. |
| `enable-logcat` | Optional | `false` | Whether to read and save logcat output to `artifacts/logcat.log` |
| `emulator-build` | Optional | N/A | Build number of a specific version of the emulator binary to use e.g. `6061023` for emulator v29.3.0.0. |
| `working-directory` | Optional | `./` | A custom working directory - e.g. `./android` if your root Gradle project is under the `./android` sub-directory within your repository. |
| `ndk` | Optional | N/A | Version of NDK to install - e.g. `21.0.6113669` |
| `cmake` | Optional | N/A | Version of CMake to install - e.g. `3.10.2.4988404` |
| `script` | Required | N/A | Custom script to run - e.g. to run Android instrumented tests on the emulator: `./gradlew connectedCheck` |

Default `emulator-options`: `-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim`.

## Can I use this action on Linux VMs?

The short answer is yes but it's expected to be a much worse experience (on some newer API levels it might not work at all) than running it on macOS.

For a longer answer please refer to [this issue](https://github.com/ReactiveCircus/android-emulator-runner/issues/46).


## Who is using Android Emulator Runner?

These are some of the open-source projects using (or used) **Android Emulator Runner**:

- [coil-kt/coil](https://github.com/coil-kt/coil/blob/master/.github/workflows)
- [cashapp/sqldelight](https://github.com/cashapp/sqldelight/blob/master/.github/workflows)
- [square/workflow-kotlin](https://github.com/square/workflow-kotlin/tree/main/.github/workflows)
- [square/retrofit](https://github.com/square/retrofit/blob/master/.github/workflows)
- [natario1/CameraView](https://github.com/natario1/CameraView/tree/master/.github/workflows)
- [natario1/Transcoder](https://github.com/natario1/Transcoder/tree/master/.github/workflows)
- [chrisbanes/insetter](https://github.com/chrisbanes/insetter/tree/main/.github/workflows)
- [slackhq/keeper](https://github.com/slackhq/keeper/tree/main/.github/workflows)
- [android/compose-samples](https://github.com/android/compose-samples/tree/main/.github/workflows)
- [ReactiveCircus/streamlined](https://github.com/ReactiveCircus/streamlined/tree/main/.github/workflows)
- [ReactiveCircus/FlowBinding](https://github.com/ReactiveCircus/FlowBinding/tree/main/.github/workflows)
- [JakeWharton/RxBinding](https://github.com/JakeWharton/RxBinding/tree/master/.github/workflows)
- [vinaygaba/Learn-Jetpack-Compose-By-Example](https://github.com/vinaygaba/Learn-Jetpack-Compose-By-Example/tree/master/.github/workflows)
- [ashishb/adb-enhanced](https://github.com/ashishb/adb-enhanced/tree/master/.github/workflows)
- [vgaidarji/ci-matters](https://github.com/vgaidarji/ci-matters/blob/master/.github/workflows/main.yaml)
- [simpledotorg/simple-android](https://github.com/simpledotorg/simple-android/tree/master/.github/workflows)
- [cashapp/copper](https://github.com/cashapp/copper/blob/trunk/.github/workflows/build.yaml)
- [square/radiography](https://github.com/square/radiography/blob/main/.github/workflows/android.yml)
- [Shopify/android-testify](https://github.com/Shopify/android-testify/blob/master/.github/workflows/sample_build.yml)
- [square/leakcanary](https://github.com/square/leakcanary/tree/main/.github/workflows)
- [hash-checker/hash-checker](https://github.com/hash-checker/hash-checker/tree/master/.github/workflows)
- [hash-checker/hash-checker-lite](https://github.com/hash-checker/hash-checker-lite/tree/master/.github/workflows)

If you are using **Android Emulator Runner** and want your project included in the list, please feel free to create an issue or open a pull request.
