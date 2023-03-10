---
title: "Props & Attributes"
slug: "props-and-attributes"
weight: 04
---

# Props & Attributes

Props are the primary way of passing data *down* the component tree.


Props are declared with the `props` class field as objects of the type
[`rx.Prop`](/reference/rx/classes/prop/). You can then set them in a template elements
parameters.

{{<hint info>}}
Other web component frameworks sometimes refer to *class fields* as props, but they are a
seperate concept in Mvui.
{{</hint>}}

You can choose to **reflect** a prop to an HTML attribute. You may want to do this for
ease of debugging (you can see the attributes in your browsers devtools) or if you want
your component to be used outside of Mvui.

{{<codeview>}}
import { Component, rx, h, define } from "@mvui/core";

class MyButton extends Component {
  props = {
    kind: new rx.Prop<'primary' | 'default'>(
      'default', { reflect: true } // false by default
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

const [ myButton ] = define(MyButton);

export default class Main extends Component {
  render() {
    return [
      myButton(),
      myButton({props: { kind: 'primary' }}),
      h.span(' <-- inspect element to see the attribute'),
    ]
  }
}


{{</codeview>}}
