# Change Log

## v2.28.0

* Add `emulator-boot-timeout` to support configuring maximum time waiting for emulator boot. - [#326](https://github.com/ReactiveCircus/android-emulator-runner/pull/326)
* Support non-integer `api-level`. - [#317](https://github.com/ReactiveCircus/android-emulator-runner/pull/317)
* Replace deprecated `ANDROID_SDK_ROOT` with `ANDROID_HOME`. - [304](https://github.com/ReactiveCircus/android-emulator-runner/pull/304)
* Update SDK command-line tools to `9.0`. - [#331](https://github.com/ReactiveCircus/android-emulator-runner/pull/331)
* Update SDK build tools to `33.0.2`. - [#331](https://github.com/ReactiveCircus/android-emulator-runner/pull/331)

## v2.27.0

* Added `pre-emulator-launch-script` to support running script after creating the AVD and before launching the emulator.  - [#247](https://github.com/ReactiveCircus/android-emulator-runner/pull/247) @nilsreichardt.
* Update to Node 16. - [#276](https://github.com/ReactiveCircus/android-emulator-runner/pull/276) @mattjohnsonpint.
* Update NPM dependencies. - [#282](https://github.com/ReactiveCircus/android-emulator-runner/pull/282) @mattjohnsonpint.
* Update README with more context on hardware acceleration on GitHub hosted runners. - [#279](https://github.com/ReactiveCircus/android-emulator-runner/pull/279) @mrk-han.


## v2.26.0

* Support [github-actions-typing](https://github.com/krzema12/github-actions-typing). - [#257](https://github.com/ReactiveCircus/android-emulator-runner/pull/257) @LeoColman.

## v2.25.0

* Auto detect hardware acceleration on Linux. - [#254](https://github.com/ReactiveCircus/android-emulator-runner/pull/254) @notbigdata.
* Update build tools to `33.0.0`.
* Update SDK command-line tools to `7.0`.

## v2.24.0

* Add option to specify `heap-size` for the AVD. - [#245](https://github.com/ReactiveCircus/android-emulator-runner/pull/245) @timusus.

## v2.23.0

* Update build tools to `32.0.0`. - [#212](https://github.com/ReactiveCircus/android-emulator-runner/pull/212)
* Update SDK command-line tools to `6.0`. - [#213](https://github.com/ReactiveCircus/android-emulator-runner/pull/213)
* Add option to specify `disk-size` for the AVD. - [#219](https://github.com/ReactiveCircus/android-emulator-runner/pull/219) @ViliusSutkus89.
* Improve logging by grouping log lines. - [#224](https://github.com/ReactiveCircus/android-emulator-runner/pull/224) @michaelkaye.

## v2.22.0

* Add option to enable hardware keyboard. - [#209](https://github.com/ReactiveCircus/android-emulator-runner/pull/209) (upstreamed from the [Doist fork](https://github.com/Doist/android-emulator-runner/commit/4b6ca99f0d657662beca3eb0c22d8e254fbd5b31)).
* Update README and fix typos. - [#203](https://github.com/ReactiveCircus/android-emulator-runner/pull/203) @JPrendy.

## v2.21.0

* Support new [ATD](https://developer.android.com/studio/preview/features#gmd-atd) targets optimized to reduce CPU and memory resources when running instrumented tests: `aosp_atd`, `google_atd`. - [#198](https://github.com/ReactiveCircus/android-emulator-runner/pull/198). Note that currently these targets require the following:
  * `api-level: 30`
  * `arch: x86` or `arch: arm64-v8a`
  * `channel: canary`

## v2.20.0

* Support non-mobile targets: `android-wear`, `android-wear-cn`, `android-tv` and `google-tv`. - [#180](https://github.com/ReactiveCircus/android-emulator-runner/pull/180) @alexvanyo.
* Update SDK command-line tools to `5.0`. - [#174](https://github.com/ReactiveCircus/android-emulator-runner/pull/174)
* Update build tools to `31.0.0`. - [#174](https://github.com/ReactiveCircus/android-emulator-runner/pull/174)
* Add option to specify the `channel` to download SDK components from: `stable` (default), `beta`, `dev` and `canary`. - [#185](https://github.com/ReactiveCircus/android-emulator-runner/pull/185)

## v2.19.1

* Accept all Android SDK Licenses to fix `sdkmanager` installation. - [#172](https://github.com/ReactiveCircus/android-emulator-runner/pull/172) @marcuspridham.

## v2.19.0

* Add option to specify `ram-size` for the AVD. - [#165](https://github.com/ReactiveCircus/android-emulator-runner/pull/165).


## v2.18.1

* Added support for setting modern emulator build ids for `emulator-build`. Not all build ids are supported until we are able to figure out at which build id the download URL pattern changed. `7425822` (version 30.7.3) is currently the last known working build id.

## v2.18.0

* Add `force-avd-creation` which when set to `false` will skip avd creation if avd with same name exists. This enables AVD snapshot caching which can significantly reduce emulator startup time. See [README.md](https://github.com/ReactiveCircus/android-emulator-runner/blob/main/README.md#usage) for a sample workflow. - [#159](https://github.com/ReactiveCircus/android-emulator-runner/pull/159)

## v2.17.0

* Add option to toggle Linux hardware acceleration - [#154](https://github.com/ReactiveCircus/android-emulator-runner/pull/154) @stevestotter

## v2.16.0

* Avoid wrapping script code in quotes - [#134](https://github.com/ReactiveCircus/android-emulator-runner/pull/134) @hostilefork
* Add option to disable spellcheck - [#143](https://github.com/ReactiveCircus/android-emulator-runner/pull/143) @AfzalivE
* Add support for arm64-v8a for Apple Silicon Macs - [#146](https://github.com/ReactiveCircus/android-emulator-runner/pull/146) @Jeehut

## v2.15.0

* Added support for specifying the number of cores to use for the emulator - [#130](https://github.com/ReactiveCircus/android-emulator-runner/pull/130).

## v2.14.3

* Support `macos-11.0` (Big Sur) runner - [#124](https://github.com/ReactiveCircus/android-emulator-runner/pull/124).

## v2.14.2

* Support API 28 system images with `google_apis` or `google_apis_playstore` target - [#117](https://github.com/ReactiveCircus/android-emulator-runner/pull/117).

## v2.14.1

* Fix hang during AVD creation when `profile` is not specified - [#113](https://github.com/ReactiveCircus/android-emulator-runner/issues/113).

## v2.14.0

* Support specifying SD card path or size via `sdcard-path-or-size`.
* Update npm packages. 
* Remove usages of deprecated `$ANDROID_HOME`.

## v2.13.0

* Updated to SDK command-line tools `3.0`.

## v2.12.0

Added support for using the `playstore` system images:

```
- name: run tests
  uses: reactivecircus/android-emulator-runner@v2
  with:
    api-level: 30
    target: playstore
    arch: x86
    script: ./gradlew connectedCheck
```

## v2.11.1

* Update SDK command-line tools to `2.1`.
* Update @actions/core to `1.2.6`.

## v2.11.0

* Support running multiple instances of the action sequentially in a single job - [#73](https://github.com/ReactiveCircus/android-emulator-runner/issues/73).

## v2.10.0

* Support Android 11 (API 30) system images.
* Bump build tools to `30.0.0`.

## v2.9.0

* Updated to SDK command-line tools `2.0`.

## v2.8.0

* Added support for specifying a custom name used for creating the **AVD** - [#59](https://github.com/ReactiveCircus/android-emulator-runner/issues/59).

## v2.7.0

* Added support for specifying versions of **NDK** and **CMake** to install.

## v2.6.2

* Fixed an issue where the Linux command-line tools binary is used for `macos`.

## v2.6.1

* Fixed SDK license issue on Linux when downloading API 28+ system images - [#42](https://github.com/ReactiveCircus/android-emulator-runner/issues/42).

## v2.6.0

* Added support for Linux VMs (no hardware acceleration) - [#15](https://github.com/ReactiveCircus/android-emulator-runner/issues/15).

## v2.5.0

* Added support for API 15-19 system images - [#26](https://github.com/ReactiveCircus/android-emulator-runner/issues/26).
* Switched to the new SDK command-line tools which supports running `sdkmanager` and `avdmanager` with Java 9+ - [#25](https://github.com/ReactiveCircus/android-emulator-runner/issues/25).

## v2.4.0

* Added support for setting custom `working-directory` - e.g. `./android` if your root Gradle project is under the `./android` sub-directory within your repository - [#22](https://github.com/ReactiveCircus/android-emulator-runner/issues/22).

## v2.3.2

* Fixed an issue where environment variables are escaped in script - [#19](https://github.com/ReactiveCircus/android-emulator-runner/issues/19).

## v2.3.1

* Bumped Android Build tools to 29.0.3.

## v2.3.0

* Added support for running the action with Java 9+ by forcing SDK manager and AVD manager to use Java 8.

## v2.2.0

* Fixed an issue where emulator is killed prematurely.
* Added `-gpu swiftshader_indirect` to default `launch-options`.
* Added support for pinning a specific `emulator-build` - e.g. `6061023` for emulator **v29.3.0.0**.

## v2.1.0

* Added support for multi-line script.

## v2.0.0

* Added action input `emulator-options` for providing command-line options used when launching the emulator. Default value is `-no-window -no-snapshot -noaudio -no-boot-anim`.
* Removed `headless` action input which is equivalent to specifying `-no-window` in the new `emulator-options` action input (included by default).

## v1.0.2

* Increased emulator boot timeout to **5 mins**.

## v1.0.1

* Fixed docs.
* Minor internal changes.

## v1.0.0

Initial release.
