# Mvui - A Minimalist Webcomponent Framework

[![Tests](https://github.com/dominiksta/mvui/actions/workflows/test-core.yml/badge.svg)](https://github.com/dominiksta/mvui/actions/workflows/test-core.yml)

*"Minimum Viable UI"*

Yes, this is a new frontend framework, and no, this is not a joke. See [the
docs](https://dominiksta.github.io/mvui/) for details.

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

I have over time regrettably lost interest in this project. There are two main reasons
for this:

1. I have since converted to the church of C# and Blazor. And yes, this *is* an ad :)
   I am *begging* you to check out C# and Blazor. You are already using MS-Tooling with
   TypeScript and VS Code, don't sleep on the Toolchain that they can create when they
   have full control over the entire stack. For this project, this means though that
   i am no longer interested in maintaining my own custom Typescript framework.
2. My taste in Code overall and Typescript more specifically has changed significantly.
   I now feel that one of the most annoying things about Typescript libraries is the
   sheer amount of extremely heavy type inference they tend to use, with all sorts
   of gymnastics, typically just to avoid the dreaded `class` keyword or decorators,
   in a language that is, fundamentally, object oriented.
   While Mvui doesn't do the latter, it does rely very heavily on type inference.
   To the point where a decent-size Mvui project like
   [Wournal](https://github.com/dominiksta/wournal/) *will* slow down the LSP on
   any slightly weaker dev box. If I had to do this all over again, I would rely
   less on type inference. Doing so here would be an enormous refactor that I just
   don't want to do for a hobby project that I am no longer interested in.

That being said, it *is* reasonably stable. I have used it to develop
[Wournal](https://github.com/dominiksta/wournal/) and that seems to work as intended.
There is also a decent amount of unit and e2e tests. In the absurdly unlikely event
that someone with different tastes would like to pick up the project, there shouldn't
be anything major stopping you from doing so.

## Dear God Why Yet Another Frontend Framework?

**Original Reasoning, see Project Status** (Though most of this still applies)

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
