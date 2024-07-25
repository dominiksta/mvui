---
title: "Props & Attributes"
slug: "props-and-attributes"
weight: 04
bookToC: false
---

# Props & Attributes

Props are the primary way of passing data *down* the component tree.


Props are declared with the `props` class field as objects of the type
[`prop`](/reference/rx/functions/prop/). You can then set them in a template elements
parameters.

{{<hint info>}}
Other web component frameworks sometimes refer to *class fields* as props, but they are a
seperate concept in Mvui.
{{</hint>}}

You can choose to **reflect** a prop to an HTML attribute. You may want to do this for
ease of debugging (you can see the attributes in your browsers devtools) or if you want
your component to be used outside of Mvui.

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
class MyButton extends Component {
  props = {
    kind: new rx.prop<'primary' | 'default'>(
      { reflect: true, defaultValue: 'default' } // false by default
    ),
  }

  render() {
    const { kind, text } = this.props;
    return [
      h.button({
        style: { color: 'white', background: kind.derive(
          k => k === 'default' ? 'black' : 'blue'
        )}
      }, 'I am a Button!')
    ];
  }
}

@Component.register
export default class Main extends Component {
  render() {
    return [
      MyButton.t(),
      MyButton.t({props: { kind: 'primary' }}),
      h.span(' <-- inspect element to see the attribute'),
    ]
  }
}
```
{{</codeview>}}
