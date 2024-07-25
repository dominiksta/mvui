---
title: ""
date: 2023-03-05T22:49:45+01:00
weight: 100
bookToC: false
---

# Getting Started

Congratulations on starting your journey to use the objectively best web frontend
framework ;)

## Hello World

To start using Mvui, start by installing the package from NPM (using your favourite
package manager):

```bash
npm install @mvuijs/core
```

If you do not already have a project set up, you can just use any vanilla JS/TS frontend
template (although you may want to set up the `tsconfig.json` to include
`"experimentalDecorators": true` in the `"compilerOptions"`). A simple "Hello World" may
look something like this:


```typescript
import { Component, h } from '@mvuijs/core';

@Component.register
class App extends Component {
  render() {
    return [
      h.div('Hello, World!'),
    ];
  }
}

document.body.appendChild(new App());
```

## Hello World Stage 2: A Counter

The typical "Stage 2 Hello World" of frontend development is building a "counter"
component. Its utility is mostly showing most basic form of (component local) state
management and event handling.

Note that the demo below is actually live! You can edit the component and change things
around as you desire. This is a common feature in this documentation. The sandbox
automatically adds the default export to the body of an internal `iframe`.

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

## Applications Built With Mvui

If you want to see Mvui used in a real-world application, you may want to take a look at
[Wournal](https://github.com/dominiksta/wournal/). In fact, Mvui was originally written
specifically for Wournal. As an example,
[here](https://github.com/dominiksta/wournal/blob/12817c9bdab84dd5a89e7cb7abf85f8c7fb38c69/src/renderer/app/color-palette-editor.ts)
is Wournals color palette editor.

If you have built an application with Mvui yourself and want to see it included here,
please [open a pull request](https://github.com/dominiksta/wournal/pulls) and it will
likely be added!
