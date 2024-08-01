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
[Component Lifecycle](/docs/components/lifecycle/)). On a state change, Mvui will then
only replace the relevant elements in the DOM.

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
on [reactivity](/docs/reactivity/overview/). Again, much like Solid, there is nothing
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
