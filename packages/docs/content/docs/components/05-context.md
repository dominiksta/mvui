---
title: "Context"
slug: "context"
weight: 05
bookToC: false
---

# Context

Props (and Attributes and Fields) are the default way to pass data *down* the component
tree. Sometimes, you may also want to get data from components *above* the current
component, or in other words, understand what the `Context` of the current component is.

An Mvui `Context` works pretty much the same as in React. It can also be seen as a kind of
dependency injection, but that is a whole other discussion.

## Basic Example

The following example should be seen as a bit of a toy. You could achieve the same end
result in an easier and more idiomatic way using events. However, the code does illustrate
how a `Context` works on a basic level.

{{<codeview>}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const myCtx = new rx.Context<rx.State<string>>();

@Component.register
class CtxProvider extends Component {
  render() {
    const ctx = this.provideContext(myCtx, new rx.State('initial'));
    return [
      h.span(ctx.derive(v => `Value: ${v}`)),
      h.div(h.slot()),
    ]
  }
}

@Component.register
class CtxConsumer extends Component {
  render() {
    const ctx = this.getContext(myCtx);
    return [
      h.button({ events: { click: _ => ctx.next('changed')} }, 'change ctx val'),
    ]
  }
}

@Component.register
export default class App extends Component {
  render() {
    return [
      CtxProvider.t([ CtxConsumer.t() ])
    ];
  }
}
```
{{</codeview>}}

Again, this is not the most useful example. However, imagine now that the `CtxConsumer`
sits somewhere deeper in the component tree and itself needs to know the value of the
provided `myCtx`. The only alternative to using a `Context` in that scenario would be
"prop drilling", meaning you continually pass the data in question to every child
component.

## A Custom `<select>` and `<option>`

Another example of how `Context`s can be useful is writing a custom implementation of
`<select>` and `<option>`. This is because the `<option>` element needs to know what the
current value is if you want to style it accordingly. If all `<option>`s were styled the
same, you could just have them emit events. But if you do want custom styling for the
active option, a `Context` is arguably the most elegant way to handle this.

{{<codeview>}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const selectCtx = new rx.Context<rx.State<string>>();

@Component.register
class Select extends Component {
  props = { selected: rx.prop<string>() }
  render() {
    const ctx = this.provideContext(selectCtx, new rx.State(''));
    this.subscribe(this.props.selected, v => ctx.next(v));

    const hideChildren = new rx.State(true);
    this.subscribe(ctx, _ => hideChildren.next(true));

    return [
      h.span(ctx.derive(v => `Value: ${v}`)),
      h.button({ events: { click: _ => hideChildren.next(v => !v) }}, 'pick'),
      h.div({
        style: {
          display: hideChildren.ifelse({if: 'none', else: 'block'})
        }
      }, [
        h.slot(),
      ]),
    ]
  }
}

@Component.register
class Option extends Component {
  props = { value: rx.prop<string>() }
  render() {
    const ctx = this.getContext(selectCtx);
    const { value } = this.props;
    const selected = ctx.derive(v => v === value.value);

    return [
      h.button({ 
        events: { click: _ => ctx.next(value.value) },
        style: {
          outline: selected.ifelse({ if: '3px solid blue', else: 'none' })
        },
      }, value),
    ]
  }
}

@Component.register
export default class App extends Component {
  render() {
    return [
      Select.t({ props: { selected: 'val1' }}, [
        Option.t({ props: { value: 'val1' }}),
        Option.t({ props: { value: 'val2' }}),
        Option.t({ props: { value: 'val3' }}),
      ])
    ];
  }
}
```
{{</codeview>}}
