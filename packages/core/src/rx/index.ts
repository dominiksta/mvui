/**
   The reactivity in mvui is defined in terms of mostly {@link Stream} and {@link State}
   objects and operators transforming them.

   @example
   ```typescript
   const state$ = new rx.State(0);
   state$.map(v => v + 1).subscribe(console.log);

   state$.next(1); state$.next(2);

   // Logs: 1 2 3
   ```

   ## What does this remind me of?

   Rxjs. It reminds you of rxjs. This is not quite an exact copy but it maps *very*
   closely to rxjs. For the most part, the key difference is only in the naming:

   - An `Observable` is now called a `Stream`
   - A `Subject` is now called a `MulticastStream`
   - A `BehaviourSubject` is now called `State`

   The reason for this renaming may be obvious when looking at the list above. A new user
   of mvui is much more likely to understand what a `State` object is supposed to do
   rather then a `BehaviourSubject`. This becomes especially apparent when taking about
   Stores. The concept of a "Store" is something that most frontend developers understand
   now. Imagine explaining to them that they should now instead be speaking of a
   "refCounted BehaviourSubject" or similar. Yeah.

   This is not meant to attack rxjs. It is a wonderful library that this module cannot
   even hope to come close to in features and power. However, the naming scheme inspired
   by the gang of four observable pattern is likely unintuitive for most people in the
   context of a "normal" frontend framework.

   Apart from the listed differences in the class names, the operators should mostly be
   very familiar. A lot of operators and some other concepts like scheduling or
   ReplaySubjects are missing, but this should hopefully not be too much of an issue in a
   common frontend app.

   @module
 */

export * from './util';
export * from './operators';
export { default as Stream } from "./stream";
export { default as MulticastStream } from "./multicast-stream";
export { default as State, LinkedState } from "./state";
export { derive, DerivedState } from "./derived-state";
export { default as Prop } from "./prop";
export { default as bind } from "./bind";
export { default as Context } from "./context";
export { default as Store } from "./store";
export { default as EMPTY } from "./empty";
export * as types from "./types";

