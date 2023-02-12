import { Component, rx, h, style } from "@mvui/core";

export default class Input extends Component {
  props = {
    value: new rx.Prop(''),
    // TODO: maybe make this an option for rx.bind ?
    onlyEmitOnBlur: new rx.Prop(false),
  };

  render = () => [
    h.input({ fields: { ...this.props }, events: {
      keyup: e => {
        if (!this.props.onlyEmitOnBlur.value)
          this.props.value.next((e.target as HTMLInputElement).value);
      },
      change: e => {
        if (this.props.onlyEmitOnBlur.value)
          this.props.value.next((e.target as HTMLInputElement).value);
      }
    }})
  ]

  static styles = style.sheet({
    'input': {
      padding: '5px',
      borderRadius: '3'
    }
  })
}
Input.register();
