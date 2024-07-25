---
title: "Defining"
slug: "defining"
weight: 02
bookToC: false
---

# Defining

All web components, including mvui components, must be registered to the "custom elements
registry". This assigns them a fixed, unique tag name (like `<my-component>`).

You *could* go the default `customElements.define('my-component', MyComponent)` way, but
mvui provides some convenience features which will make life easier.

```typescript
import { Component, h } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  render() {
    return [ h.div('Hello World!') ];
  }
}

// If you want to not use decorators (for example in vanilla JS), this call is
// equivalent to the `@Component.register` decorator:
MyComponent.register();
```

But wait, where did we specify the tag name? In this case, we didn't, and mvui will assume
that what you wanted was `'<app-my-component>'`. You can customize the tag name by
specifying both a *prefix* and a *suffix*:

```typescript
import { Component, h } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  static tagNameSuffix = 'fancy-component-name';
  static tagNameLibrary = 'myapp';

  render() {
    return [ h.div('Hello World!') ];
  }
}
```

This will register the component as '`<myapp-fancy-component-name>`'. Note that the
automatic detection of component names to register only works if you do not minify
classnames.

## Advanced: Avoiding naming conflicts

You may have noticed that the property we used to specify the prefix was not called
`tagNamePrefix` but `tagNameLibrary`. The reason is that you can change the tag name
prefixes of other mvui libraries to avoid naming conflicts.

Let's pretend you have are writing library called `toaster`, which you use to control your
actual toaster. But you want to use an mvui component library also called `toaster`, that
displays toast notifications on screen. You can avoid conflicts in your tag names like so:

```typescript
// in some global startup file:
import { MVUI_GLOBALS } from "@mvuijs/core";

// This code has to run *before you load the 'toaster'* library and your own
// components!
// It also assumes that the author of the 'toaster' library has set
// `static tagNameLibrary = 'toaster'` for all their components and that you
// have set `static tagNameLibrary = 'toaster-control'` for all your components.

MVUI_GLOBALS.PREFIXES.set('toaster', 'toaster-notify');
MVUI_GLOBALS.PREFIXES.set('toaster-control', 'toaster');
```

Other web component frameworks typically do not allow you to do this and will just assign
a static tag name on import. In that case, you just have to live with that tag name and
name your components differently. There are technically some really nasty hacks to edit
the customElements registry, but for now there is no reliable way of doing so.
