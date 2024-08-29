---
title: "State & Rendering"
slug: "state_and_rendering"
weight: 03
bookToC: false
---

# State & Rendering

How a frontend framework handels rendering when some state is updated is arguably one of
the most essential things about it. Roughly speaking, Mvui will render each component
**only once**, when it is attached to the DOM (specifics will be discussed in the page on
[Component Lifecycle](/mvui/docs/components/lifecycle/)). On a state change, Mvui will
then only replace the relevant elements in the DOM.

Recall the "counter" example from earlier:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
export default class CounterComponent extends Component {
  render() {
    const count = new rx.State(0);
    return [
      h.button(
        { events: { click: () => count.next(v => v + 1) } },
        'Click Me'
      ),
      h.span(count.derive(v => ` Count: ${v}`)),
    ];
  }
}
```
{{</codeview>}}

A click on the "Click Me" button will **only update the contents of the `<span>`
element**. The rest of the components DOM will not be re-rendered. In this respect, Mvui
is more similar to frameworks like Solid rather then React.

What the example also shows is the most basic state container: `rx.State`. There are many
more advanced state management mechanisms, but these will be covered later in the chapter
on [reactivity](/mvui/docs/reactivity/overview/). Again, much like Solid, there is nothing
stopping you from declaring state *anywhere*, even completely outside of the component
tree:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

const count = new rx.State(0);
const countStr = count.derive(v => ` Count: ${v}`);

@Component.register
export default class CounterComponent extends Component {
  render() {
    return [
      h.button(
        { events: { click: () => count.next(v => v + 1) } },
        'Click Me'
      ),
      h.span(countStr),
    ];
  }
}
```
{{</codeview>}}

In general though, the `render()` method of a component is a good default place to define
state.

## Two-Way Bindings

Mvui allows for two-way bindings of state to arbitrary fields, props and attributes of
child components. This also works with third-party or custom components as long as they
fire a `change` or `keyup` event to notify the parent.

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  render() {
    const value = new rx.State('initial');
    return [
      h.input({ fields: { value: rx.bind(value) }}),
      h.input({ fields: { value: rx.bind(value) }}),
      h.span(value),
    ];
  }
}
```
{{</codeview>}}

## Reactive Lists

One rather common thing to encounter in your frontend-journey is wanting to let the user
*edit* a *list* of some data. While *displaying* such data can be done with simple state
derivation, Mvui provides the special `h.foreach` helper for editing reactive list data.

Consider the following example:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  render() {
    const list = new rx.State(['one', 'two', 'three']);
    return [
      h.section(
        list.derive(l => l.map((listEl, i) => h.input({
          fields: { value: listEl },
          events: {
            keyup: e => {
              list.value[i] = (e.target as HTMLInputElement).value;
              list.next(l => [...l]);
            }
          }
        }))),
      ),
      h.section(h.pre(list.derive(JSON.stringify))),
    ];
  }
}
```
{{</codeview>}}

When you type in one of the input fields, the value updates immediatly but will lose
focus. (This is the same behaviour React will bother you with if you forget to provide a
`key` attribute.) To fix this (and have the code be slightly more readable), you can use
the mentioned `h.foreach` helper:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  render() {
    const list = new rx.State(['one', 'two', 'three']);
    return [
      h.section(
        h.foreach(list, 'pos', (listEl, i) => h.input({
          fields: { value: listEl },
          events: {
            keyup: e => {
              list.value[i] = (e.target as HTMLInputElement).value;
              list.next(l => [...l]);
            }
          }
        })),
      ),
      h.section(h.pre(list.derive(JSON.stringify))),
    ];
  }
}
```
{{</codeview>}}

`h.foreach` fixes many more behavioural issues around editing reactive lists. In general,
you should prefer using it over regular state derivation. Also, if you can, you should
provide a `trackBy` function that uniquely identifies list elements with a string. In
some/many scenarious this is not possible or necessary, and so you can do what we have
done in the example above and simply provide the string `'pos'` as a `trackBy` function,
which will instruct Mvui to track identify the values by their position in the list. This
can and will cause weird behaviour if you do complex reordering operations on the list. As
long as you only do simple things like edit elements in place, maybe add or remove single
elements, you should be fine with just `'pos'` though.
