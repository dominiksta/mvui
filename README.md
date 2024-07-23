# Mvui - A Minimalist Webcomponent Framework

[![Tests](https://github.com/dominiksta/mvui/actions/workflows/test-core.yml/badge.svg)](https://github.com/dominiksta/mvui/actions/workflows/test-core.yml)

*"Minimum Viable UI"*

Yes, this is a new frontend framework, and no, I am not joking.

```typescript
import { Component, rx, h } from '@mvuijs/core';

@Component.register
export class CounterComponent extends Component {
  render() {
    const count = new rx.State(0);
    return [
      h.p([
        h.button({ events: {
          click: _ => count.next(c => c + 1)
        }}, 'Increment'),
        h.span(count.derive(v => `count: ${v}`))
      ])
    ];
  }
}
```

## Projects Status

There is still some cleanup work to be done. This should be considered pre-alpha for the
time being. However, the code should be reasonably clean and short, so if you are
interested in how to implement a simple frontend framework, then you can perhaps find some
educational use in this repository.

My intention is to write at least one actual application with Mvui before publishing it to
npm.

## Dear God Why Yet Another Frontend Framework?

Fundamentally, I (@dominiksta) believe that frontend development is *significantly*
overcomplicated for small to medium size applications. Mvui is built on this intuition. It
does not strive for perfection in nether syntax nor performance nor its programming model
but to simply be *good enough* while making it easy to reason about the code.

**Core Features**:

- A fully typesafe component model based on webcomponents
- Templates and styling are defined in TS/JS, so there are no special requirements for
  your editor and they can be typechecked
- Reactivity is implemented on top of a very minimal recreation of some the core
  principles of rxjs. This has several advantages:
  - The reactivity is independent of the component model, much like signals in
    SolidJS. You can write your business logic reactively while not locking yourself into
    using Mvui.
  - Updates to the DOM only happen exactly where some value has changed. Much like SolidJS
    (all be it less powerful), a component renders only once upon being mounted. When an
    Observable is used in the template, it is automatically subscribed to and any change
    to it will trigger a DOM update.
  - Anyone familiar with ReactiveX or rxjs or angular should be immediatly familiar with
    the reactivity model.
- Wrapping existing Webcomponents to work with Mvui in a typesafe way
