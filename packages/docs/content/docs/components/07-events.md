---
title: "Events"
slug: "events"
weight: 07
bookToC: false
---

# Events

## Basics

Handling events of child components in Mvui is pretty simple. You just provide a callback
in the template:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";


@Component.register
export default class MyComponent extends Component {
  render() {
    return [
      h.button(
        { events: { click: () => alert('hi') } },
        'Click Me'
      ),
    ];
  }
}
```
{{</codeview>}}

## Typescript

What is more interesting is how you can *type* custom events. This is done by specifying
event information in the generic type of the `Component` base class and using
`this.dispatch` in the emitting component:

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
class EventEmitter extends Component<{
  events: { 'custom': CustomEvent<string> }
}> {
  render() {
    return [
      h.button(
        { events: { click: () => this.dispatch('custom', 'evt value') } },
        'Click Me'
      ),
    ];
  }
}

@Component.register
export default class EventReceiver extends Component {
  render() {
    return [
      EventEmitter.t({ events: { custom: e => alert(e.detail) }}),
    ]
  }
}
```
{{</codeview>}}

## Why not Pass Callbacks?

Many other frameworks like React or Solid do not really use events. Instead, they expect
you to pass callbacks as props to do the same thing. Mvui does allow you to write this,
but it is not really idiomatic web component behavior.


{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
class EventEmitter extends Component {
  props = {
    onChange: rx.prop<((val: string) => void)>(),
  }

  render() {
    return [
      h.button(
        { events: { click: () => this.props.onChange.value('evt value') } },
        'Click Me'
      ),
    ];
  }
}

@Component.register
export default class EventReceiver extends Component {
  render() {
    return [
      EventEmitter.t({ props: { onChange: val => alert(val) }}),
    ]
  }
}
```
{{</codeview>}}
