---
title: "Synchronous"
slug: "synchronous"
weight: 02
bookToC: false
---

# Synchronous Reactivity

Synchronous reactivity deals with the transition of state that is, well,
synchronous. Things like handling user events (with concepts like debouncing) or making
HTTP API calls are considered asynchronous reactivity and will be covered in the next
chapter.

## State and Subscriptions

The most basic object for reactivity is the `State` object you have already seen in
previous chapters. What we have not discussed yet is how you can *subscribe* to state with
a callback:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const state = new rx.State(0);
// ALWAYS handle unsubscribing somewhere if you are not absolutely certain that
// you want a "dangling" subscription
const unsubscribe = state.subscribe(value => console.log(value + 1));
state.next(1);
unsubscribe();
state.next(2); // this is no longer logged after the unsubscribe()
```
{{</codeview>}}

When you use a `State` object in a template, Mvui will handle the subscription internally
by subscribing when the component is mounted and unsubscribing when the component is
removed from the DOM.

### Deriving State

You can synchronously derive state from other existing state. `DerivedState` objects still
have a `.value` field that you can query without subscribing.

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const state = new rx.State(0);
const derived = state.derive(n => n + 1);
const unsub = derived.subscribe(console.log);
state.next(1);
unsub();
console.log(derived.value);
```
{{</codeview>}}

You can also do a "nested" `.derive()` on already derived state:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const state = new rx.State(0);
const derived = state.derive(n => n + 1);
const derivedFromDerived = derived.derive(n => n * 2);
derivedFromDerived.subscribe(console.log);
state.next(1);
```
{{</codeview>}}

Finally, you can also derive from multiple state objects at once:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const s1 = new rx.State(0);
const s2 = new rx.State(1);
const derived = rx.derive(s1, s2, (s1, s2) => s1 + s2);
derived.subscribe(console.log);
s1.next(1);
```
{{</codeview>}}

## Partial State

If you store state in an object (`{ val1: 1, val2: 2 }`), you can create a derived partial
`State` object that refers to a key of that object. You can use this for example to have
one `State` object that stores all information in a form and then bind partial state
objects to the form fields.

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const user = new rx.State({ name: 'l33th4x0r', pwhash: 'x772allll2' });
const pwhash = user.partial('pwhash');
user.subscribe(console.log);
pwhash.next('deadbeef');
```
{{</codeview>}}

## Stores

Mvui provides a `Store` object similar to libaries like Redux. The pros and cons of using
these over "plain" `State` objects is a wide debate that is out of scope for this
documentation. In general however, `Store`s make a lot of sense for managing *global*
state. How much state should be global is arguably a matter of personal taste. They are
also useful for when you want to colocate all of the state manipulation logic of a
component into one place, making it potentially easier to read.

A store consists of three parts: state, selectors and reducers. The state is, well, the
state of the store. This is typically some js object with various fields. The reducers are
*pure* functions that modify the state (you should not modify the state directly without
using a reducer). And finally, the selectors define derivations from the actual state of
the store.

{{<codeview output-height="100px">}}
```typescript
import { rx } from '@mvuijs/core';

const store = new rx.Store({
  initialState: { p1: 4, p2: 'hi' },
  reducers: {
    lower: v => ({ ...v, p2: v.p2.toLowerCase() }),
    upper: v => ({ ...v, p2: v.p2.toUpperCase() }),
    concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
  },
  selectors: {
    appendWorld: v => v.p2 + ' World',
  }
});

const unsub = store.state.subscribe(console.log);
store.reduce.lower();
store.reduce.concat(' hey');
unsub();
console.log(store.select.appendWorld.value);
```
{{</codeview>}}
