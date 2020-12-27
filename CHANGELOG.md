# Change Log

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
