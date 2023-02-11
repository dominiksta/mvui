# Mvui - A Minimalist Webcomponent Framework

*"Minimum Viable UI"*

Yes, this is a new frontend framework, and no, I am not joking.

```typescript
export class CounterComponent extends Component {
  #count$ = new rx.State(0);

  render = () => [
    h.p([
      h.button({ events: {
        click: _ => this.#count$.next(this.#count$.value + 1)
      }}, 'Increment'),
      h.span(this.#count$.map(v => `count: ${v}`))
    ])
  ];
}
```

## Projects Status

There is still some cleanup work to be done and a standard library of components to be
written. This should be considered pre-alpha for the time being. However, the code should
be reasonably clean and short, so if you are interested in how to implement a simple
frontend framework, then you can perhaps find some educational use in this repository.

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
