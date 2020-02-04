# Change Log

## v2.3.2

* Fixed an issue where environment variables are escaped in script.

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
