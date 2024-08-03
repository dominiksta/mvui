---
title: "Lifecycle"
slug: "lifecycle"
weight: 07
bookToC: false
---

# Lifecycle

## Basics

The `render()` method of a component will be called *every time the component is mounted*
to the DOM. This is generally speaking a good place to declare component local
state. There are cases where you might need to run code *after* the component is done
rendering (code you write in the render method will run just *before* rendering) or when
it is unmounted. For these situations, mvui provides two lifecycle hooks:

- `this.onRemoved(<callback>)` will run the callback on unmount
- `this.onRendered(<callback>)` will run the callback after the component is
  rendered. Recall that components in mvui will only render once when mounted and
  subsequent state changes will only update the relevant DOM.

{{<hint info>}}
Callbacks added with `onRemoved` and `onRendered` will be **deleted on each new render**
because you are expected to define them in the `render()` method.
{{</hint>}}

{{<codeview output-height="150px">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const lifecycle = new rx.State(['initial']);

@Component.register
class LifecycleTest extends Component {
  render() {
    lifecycle.next(v => [ ...v, 'added' ]);
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

You can use `this.onRemoved(<callback>)` to clean up manual resources like manual
subscriptions. While you generally speaking should try to avoid manual subscriptions for a
more declarative style, there are some use cases where they may be required (or desirable
for your sanity as a non-expert in reactive programming).

{{<codeview output-height="150px">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

@Component.register
export default class Wrapper extends Component {
  render() {
    // imagine this being a websocket connection or something similar
    const resource = rx.timer(2000).pipe(rx.map(_ => 'changed'));
    const state = new rx.State('initial');

    // a `subscribe` returns the `unsubscribe` function, so this line cleans up
    // the subscription on onmount
    this.onRemoved(resource.subscribe(v => state.next(v)));

    return [ h.div(state) ]
  }
}
```
{{</codeview>}}

## Keeping local state after unmount

As stated above, the `render()` method of your component will be called on every
render. Therefore, if you define some state in the that method it will be reset every time
the component is unmounted. If you still want instance scoped state but you don't want it
to be reset on unmount, you can define it as a class field.

{{<codeview output-height="150px">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

@Component.register
class LifecycleTest extends Component {
  stickyState = new rx.State(100);

  render() {
    const state = new rx.State(0);

    return [
      h.button({
        fields: { id: 'inc' },
        events: { click: _ => state.next(c => c + 1)},
      }, 'Increment Local'),
      h.button({
        fields: { id: 'incSticky' },
        events: { click: _ => this.stickyState.next(c => c + 1)},
      }, 'Increment Sticky'),
      h.div({ fields: { id: 'display' }}, [
        'Normal: ', h.span(state)
      ]),
      h.div({ fields: { id: 'displaySticky' }}, [
        'Sticky: ', h.span(this.stickyState)
      ]),
    ];
  }
}

@Component.register
export default class Wrapper extends Component {
  render() {
    const displayChild = new rx.State(false);
    const child = new LifecycleTest();

    return [
      h.button({
        events: { click: _ => displayChild.next(v => !v) }
      }, 'Toggle Child Mount'),
      h.div(
        displayChild.ifelse({ if: child, else: undefined }),
      )
    ]
  }
}
```
{{</codeview>}}

## No `onCreated` or `onMounted`?

There is no lifecycle hook like `onCreated` because you can just override the
constructor. There is no `onMounted` because you can just write code in the `render()`
method.
