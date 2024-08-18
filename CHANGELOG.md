Changelog
======================================================================

`0.0.4` - _unreleased_
----------------------------------------------------------------------

**Fixed**:

- You can use `Component`s as props and fields. Previously they were erroneously treated
  as `Subscribable` because they have a `subscribe` method.

`0.0.3` - _2024-08-04_
----------------------------------------------------------------------

**Added**

- Exported a few types you may sometimes want to import: `Fragment`, `rx.OptionalProp`,
  `rx.PropOptions`, `rx.StreamInput`, `rx.StreamInterop`, `rx.StreamInteropRxJS`,
  `rx.ObserverDefinitionInterop`.

**Fixed**

- Passing a callback function in a template would pass the callback directly to the `next`
  method of `State`, causing it to be interpreted as a transformation function.

**Breaking Changes**

- Removed `Component.pierceShadow`. This feature was way too hacky and usage could quickly
  degreade performance. Hopefully browsers will allow overwriting Shadow DOM CSS natively
  in the future.
- Renamed `style.currentTheme$` to `style.currentTheme` for consistency.
- Advanced: Removed `wheel` event from `fromAllEvents`. This means `rx.bind` will no
  longer update a value on a mouse wheel event.

`0.0.2` - _2024-07-24_
----------------------------------------------------------------------
*Working First Alpha Release*

`0.0.1` - _2024-07-23_
----------------------------------------------------------------------
*Initial Test Release*
