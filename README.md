# GitHub Action - Android Emulator Runner

<p align="left">
  <a href="https://github.com/ReactiveCircus/android-emulator-runner"><img alt="GitHub Actions status" src="https://github.com/ReactiveCircus/android-emulator-runner/workflows/Main%20workflow/badge.svg"></a>
</p>

A GitHub Action for installing, configuring and running hardware-accelerated Android Emulators on macOS virtual machines.

The old ARM-based emulators were slow and are no longer supported by Google. The modern Intel Atom (x86 and x86_64) emulators can be fast, but require hardware acceleration (HAXM on Mac & Windows, KVM on Linux) from the host. This presents a challenge on CI especially when running hardware accelerated emulators within a docker container, because **Nested Virtualization** must be supported by the host VM which isn't the case for most cloud-based CI providers due to infrastructural limits. If you want to learn more about this, here's an article [Yang](https://github.com/ychescale9) wrote: [Running Android Instrumented Tests on CI](https://dev.to/ychescale9/running-android-emulators-on-ci-from-bitrise-io-to-github-actions-3j76).

The **macOS** 10.x VM provided by **GitHub Actions** had **HAXM** [pre-installed](https://github.com/actions/runner-images/blob/main/images/macos/macos-10.15-Readme.md) so we were able to create a new AVD instance, launch an emulator with hardware acceleration and run our Android
tests directly on the VM. However, Github's [macOS-11](https://github.com/actions/runner-images/blob/main/images/macos/macos-11-Readme.md) and [macOS-12](https://github.com/actions/runner-images/blob/main/images/macos/macos-12-Readme.md) VMs **no longer** come pre-installed with HAXM. See [here](https://github.com/actions/runner-images/issues/183#issuecomment-610723516) and [here](https://github.com/actions/runner-images/issues/6388) for more info. **To run with HAXM on the macOS-11 and macOS-12 agents, you must install HAXM before starting your emulator**. See: [this snippet](https://gist.github.com/mrk-han/a0a11ed9bed966bb8b775ff55f2a87e9) for more info.

For Linux, Nested virtualization is possible with hardware acceleration on a self-hosted or 3rd party runner, but the VM will need to be hosted on a compatible machine that allows you to enable KVM, or is already configured with  - for example the AWS EC2 Bare Metal instances. **The Github-hosted Linux runners are not currently KVM compatible.**

## Purpose

This action helps automate and configure the process of setting up an emulator and running your tests by doing the following:

- Install / update the required **Android SDK** components including `build-tools`, `platform-tools`, `platform` (for the required API level), `emulator` and `system-images` (for the required API level).
- Create a new instance of **AVD** with the provided [configurations](#configurations).
- Launch a new Emulator with the provided [configurations](#configurations).
- Wait until the Emulator is booted and ready for use.
- Run a custom script provided by user once the Emulator is up and running - e.g. `./gradlew connectedCheck`.
- Kill the Emulator and finish the action.

## Usage & Examples

A workflow that uses **android-emulator-runner** to run your instrumented tests on **API 29**:

```yml
jobs:
  test:
    runs-on: macos-latest
    steps:
      - name: checkout
        uses: actions/checkout@v3

      - name: run tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 29
          script: ./gradlew connectedCheck
```

We can also leverage GitHub Actions's build matrix to test across multiple configurations:

```yml
jobs:
  test:
    runs-on: macos-latest
    strategy:
      matrix:
        api-level: [21, 23, 29]
        target: [default, google_apis]
    steps:
      - name: checkout
        uses: actions/checkout@v3

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

```yml
jobs:
  test:
    runs-on: macos-latest
    steps:
      - name: checkout
        uses: actions/checkout@v3

      - name: run tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 29
          ndk: 21.0.6113669
          cmake: 3.10.2.4988404
          script: ./gradlew connectedCheck
```

We can significantly reduce emulator startup time by setting up AVD snapshot caching:

1. add a `gradle/gradle-build-action@v2` step for caching Gradle, more details see [#229](https://github.com/ReactiveCircus/android-emulator-runner/issues/229)
2. add an `actions/cache@v3` step for caching the `avd`
3. add a `reactivecircus/android-emulator-runner@v2` step to generate a clean snapshot - specify `emulator-options` without `no-snapshot`
4. add another `reactivecircus/android-emulator-runner@v2` step to run your tests using existing AVD / snapshot - specify `emulator-options` with `no-snapshot-save`

```yml
jobs:
  test:
    runs-on: macos-latest
    strategy:
      matrix:
        api-level: [21, 23, 29]
    steps:
      - name: checkout
        uses: actions/checkout@v3

      - name: Gradle cache
        uses: gradle/gradle-build-action@v2
        
      - name: AVD cache
        uses: actions/cache@v3
        id: avd-cache
        with:
          path: |
            ~/.android/avd/*
            ~/.android/adb*
          key: avd-${{ matrix.api-level }}

      - name: create AVD and generate snapshot for caching
        if: steps.avd-cache.outputs.cache-hit != 'true'
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: ${{ matrix.api-level }}
          force-avd-creation: false
          emulator-options: -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim -camera-back none
          disable-animations: false
          script: echo "Generated AVD snapshot for caching."

      - name: run tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: ${{ matrix.api-level }}
          force-avd-creation: false
          emulator-options: -no-snapshot-save -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim -camera-back none
          disable-animations: true
          script: ./gradlew connectedCheck
```

## Configurations

| **Input** | **Required** | **Default** | **Description** |
|-|-|-|-|
| `api-level` | Required | N/A | API level of the platform system image - e.g. 23 for Android Marshmallow, 29 for Android 10. **Minimum API level supported is 15**. |
| `target` | Optional | `default` | Target of the system image - `default`, `google_apis`, `playstore`, `android-wear`, `android-wear-cn`, `android-tv`, `google-tv`, `aosp_atd` or `google_atd`. Note that `aosp_atd` and `google_atd` currently require the following: `api-level: 30`, `arch: x86` or `arch: arm64-v8` and `channel: canary`. |
| `arch` | Optional | `x86` | CPU architecture of the system image - `x86`, `x86_64` or `arm64-v8a`. Note that `x86_64` image is only available for API 21+. `arm64-v8a` images require Android 4.2+ and are limited to fewer API levels (e.g. 30). |
| `profile` | Optional | N/A | Hardware profile used for creating the AVD - e.g. `Nexus 6`. For a list of all profiles available, run `avdmanager list device`. |
| `cores` | Optional | 2 | Number of cores to use for the emulator (`hw.cpu.ncore` in config.ini). |
| `ram-size` | Optional | N/A | Size of RAM to use for this AVD, in KB or MB, denoted with K or M. - e.g. `2048M` |
| `heap-size` | Optional | N/A | Heap size to use for this AVD, in KB or MB, denoted with K or M. - e.g. `512M` |
| `sdcard-path-or-size` | Optional | N/A | Path to the SD card image for this AVD or the size of a new SD card image to create for this AVD, in KB or MB, denoted with K or M. - e.g. `path/to/sdcard`, or `1000M`. |
| `disk-size` | Optional | N/A | Disk size, or partition size to use for this AVD. Either in bytes or KB, MB or GB, when denoted with K, M or G. - e.g. `2048M` |
| `avd-name` | Optional | `test` | Custom AVD name used for creating the Android Virtual Device. |
| `force-avd-creation` | Optional | `true` | Whether to force create the AVD by overwriting an existing AVD with the same name as `avd-name` - `true` or `false`. |
| `emulator-options` | Optional | See below | Command-line options used when launching the emulator (replacing all default options) - e.g. `-no-window -no-snapshot -camera-back emulated`. |
| `disable-animations` | Optional | `true` | Whether to disable animations - `true` or `false`. |
| `disable-spellchecker` | Optional | `false` | Whether to disable spellchecker - `true` or `false`. |
| `disable-linux-hw-accel` | Optional | `auto` | Whether to disable hardware acceleration on Linux machines - `true`, `false` or `auto`.|
| `enable-hw-keyboard` | Optional | `false` | Whether to enable hardware keyboard - `true` or `false`. |
| `emulator-build` | Optional | N/A | Build number of a specific version of the emulator binary to use e.g. `6061023` for emulator v29.3.0.0. |
| `working-directory` | Optional | `./` | A custom working directory - e.g. `./android` if your root Gradle project is under the `./android` sub-directory within your repository. |
| `ndk` | Optional | N/A | Version of NDK to install - e.g. `21.0.6113669` |
| `cmake` | Optional | N/A | Version of CMake to install - e.g. `3.10.2.4988404` |
| `channel` | Optional | stable | Channel to download the SDK components from - `stable`, `beta`, `dev`, `canary` |
| `script` | Required | N/A | Custom script to run - e.g. to run Android instrumented tests on the emulator: `./gradlew connectedCheck` |

Default `emulator-options`: `-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim`.

## Can I use this action on Github Hosted Linux VMs?

The short answer is yes but on Github-hosted Linux runners it's expected to be a much worse experience (on some newer API levels it might not work at all) than running it on macOS, because of the current lack of hardware acceleration support. You can get it running much faster on self-hosted Linux runners but only if the underlying instances support KVM (which most don't). Things might be better on the newer Larger runners but they are still in Beta. It is possible to use this Action with hardware accelerated Linux VMs hosted by a third-party runner provider.

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
- [Kiwix/kiwix-android](https://github.com/kiwix/kiwix-android/blob/develop/.github/workflows)
- [wikimedia/apps-android-wikipedia](https://github.com/wikimedia/apps-android-wikipedia/blob/main/.github/workflows)
- [google/android-fhir](https://github.com/google/android-fhir/tree/master/.github/workflows)
- [google/accompanist](https://github.com/google/accompanist/blob/main/.github/workflows)
- [dotanuki-labs/norris](https://github.com/dotanuki-labs/norris/blob/master/.github/workflows/main.yml)
- [tinylog-org/tinylog](https://github.com/tinylog-org/tinylog/blob/v3.0/.github/workflows/build.yaml)
- [hzi-braunschweig/SORMAS-Project](https://github.com/hzi-braunschweig/SORMAS-Project/blob/development/.github/workflows/sormas_app_ci.yml)

If you are using **Android Emulator Runner** and want your project included in the list, please feel free to open a pull request.
