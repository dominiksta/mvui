---
title: "Lifecycle"
slug: "lifecycle"
weight: 07
bookToC: false
---

# Lifecycle

## Basics

The `render()` method of a component will be called *the first time the component is
mounted* to the DOM. This is generally speaking a good place to declare component local
state. There are cases where you might need to run code *after* the component is done
rendering (code you write in the render method will run just *before* rendering) or when
it is unmounted. For these and other situations, Mvui provides two lifecycle hooks:

- `this.onAdded(<callback>)` will run the callback on every mount (if its the first mount,
  it will run before rendering)
- `this.onRemoved(<callback>)` will run the callback on unmount
- `this.onRendered(<callback>)` will run the callback after the component is
  rendered. Recall that components in Mvui will only render once when first mounted and
  subsequent state changes will only update the relevant DOM.

{{<hint info>}}
Callbacks added with `onRemoved`, `onRendered` and `onAdded` can be removed with the
`removeLifecycleHook`. You won't have to do this very often since these callbacks should
be cleaned up by garbage collection when the component in question is no longer referenced
anywhere.
{{</hint>}}

{{<codeview output-height="150px">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const lifecycle = new rx.State(['initial']);

@Component.register
class LifecycleTest extends Component {
  render() {
    this.onAdded(() => lifecycle.next(v => [ ...v, 'added' ]));
    this.onRendered(() => lifecycle.next(v => [ ...v, 'rendered' ]));
    this.onRemoved(() => lifecycle.next(v => [ ...v, 'removed' ]));

    return [
      h.fieldset([
        h.legend('Child'),
        h.div(lifecycle.map(v => v.map(l => h.span(l + ', ')))),
      ])
    ];
  }
}

@Component.register
export default class Wrapper extends Component {
  render() {
    const displayChild = new rx.State(false);

    return [
      h.button({
        events: { click: _ => displayChild.next(v => !v) }
      }, 'Toggle Child Mount'),
      h.div(
        displayChild.ifelse({
          if: LifecycleTest.t(),
          else: undefined,
        })
      )
    ]
  }
}
```
{{</codeview>}}

## Closing Local Resources (e.g. Subscriptions)

You can use `this.subscribe(<callback>)` to subscribe to a `Stream` (we will talk those
later in the chapter on [reactivity](/mvui/docs/reactivity/overview/)) *only when the
component is mounted*. While you generally speaking should try to avoid manual
subscriptions for a more declarative style, there are some use cases where they may be
required (or desirable for your sanity as a non-expert in reactive programming).

{{<codeview output-height="150px">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

@Component.register
export default class Wrapper extends Component {
  render() {
    // imagine this being a websocket connection or something similar
    const resource = rx.timer(2000).pipe(rx.map(_ => 'changed'));
    const state = new rx.State('initial');

    // this subscription is only active while the component is mounted
    this.subscribe(resource, v => state.next(v));

    return [ h.div(state) ]
  }
}
```
{{</codeview>}}
