Changelog
======================================================================

`0.0.4` - _2024-08-29_
----------------------------------------------------------------------

**Breaking Changes**:

- Intermediate: The component lifecycle has changed to only render *once* on the first
  component mount instead of every mount. This means that `render()` functions will now
  only be called once per component instance. The new `onAdded()` method can be used to
  run code on every mount from now on. Please Refer to [the
  documentation](https://dominiksta.github.io/mvui/docs/components/props-and-attributes/)
  for more details.
- Advanced: `rx.derive` no longer memoizes `object`s by default. Some derived state may
  therefore update more frequently.

**Added**:

- `h.foreach` helper to render multiple elements from a reactive value. This was kind of
  possible previously by just using `rx.derive` or `rx.map`, but `h.foreach` allows
  skipping re-renders to retain focus. The idea is very similar to [key in
  React](https://react.dev/learn/rendering-lists) or [trackBy in
  Angular](https://stackoverflow.com/questions/42108217/how-to-use-trackby-with-ngfor).

**Fixed**:

- You can use `Component`s as props and fields. Previously they were erroneously treated
  as `Subscribable` because they have a `subscribe` method.
- The `rx.fromEvent` operator is now shared by default. This should at least slightly
  reduce the amount of active event listeners.

`0.0.3` - _2024-08-04_
----------------------------------------------------------------------

**Breaking Changes**

- Removed `Component.pierceShadow`. This feature was way too hacky and usage could quickly
  degreade performance. Hopefully browsers will allow overwriting Shadow DOM CSS natively
  in the future.
- Renamed `style.currentTheme$` to `style.currentTheme` for consistency.
- Advanced: Removed `wheel` event from `fromAllEvents`. This means `rx.bind` will no
  longer update a value on a mouse wheel event.

**Added**

- Exported a few types you may sometimes want to import: `Fragment`, `rx.OptionalProp`,
  `rx.PropOptions`, `rx.StreamInput`, `rx.StreamInterop`, `rx.StreamInteropRxJS`,
  `rx.ObserverDefinitionInterop`.

**Fixed**

- Passing a callback function in a template would pass the callback directly to the `next`
  method of `State`, causing it to be interpreted as a transformation function.

`0.0.2` - _2024-07-24_
----------------------------------------------------------------------
*Working First Alpha Release*

`0.0.1` - _2024-07-23_
----------------------------------------------------------------------
*Initial Test Release*
