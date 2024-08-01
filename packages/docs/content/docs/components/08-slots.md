---
title: "Slots"
slug: "slots"
weight: 08
bookToC: false
---

# Slots

The HTML `<slot>` element allows declaring where child elements should go in the output
HTML. This is useful in a lot of situations, such as components defining a generic layout
or just as part of a components api (think `<select>` and `<option>`). Slots are a
standard Web Component feature; They are not specific to Mvui.

{{<codeview output-height="100px">}}
```typescript
import { Component, h } from '@mvuijs/core';

@Component.register
class MyLayout extends Component {
  render = () => [
    h.div('"--- Content:"'),
    h.div(h.slot()),
    h.div('"--- After Content"'),
  ]
}

@Component.register
export default class SlotsTest extends Component {
  render = () => [
    MyLayout.t([
      h.div('Content Children'),
      h.div('Content Children 2'),
    ])
  ]
}
```
{{</codeview>}}

## Multiple (Named) and Typed Slots

You can specify multiple slots using the `name` attribute. Mvui also allows you to define
what elements you want to allow as valid children using the generic type of
`Component`. To use named (and typed) slots, use the `slots` field of the components
template parameters.

{{<codeview output-height="200px">}}
```typescript
import { Component, h } from '@mvuijs/core';

@Component.register
class MyLayout extends Component<{
  slots: {
    'header': any,
    'footer-only-div': HTMLDivElement,
  }
}> {
  render = () => [
    h.div('"Header:"'),
    h.div(h.slot({ attrs: { name: 'header' } })),
    h.div('"Content (Default Slot):"'),
    h.div(h.slot()),
    h.div('"Footer:"'),
    h.slot({ attrs: { name: 'footer-only-div' } }),
  ]
}

@Component.register
export default class SlotsTest extends Component {
  render = () => [
    MyLayout.t({
      slots: {
        'header': h.span('My Header'),
        'footer-only-div': [ h.div('My Footer') ],
      }
    }, [
      h.div('Content Children'),
      h.div('Content Children 2'),
    ])
  ]
}
```
{{</codeview>}}
