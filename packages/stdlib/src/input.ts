import { Component, rx, h, style } from "@mvui/core";

export default class Input extends Component {
  static styles = style.sheet({
    'input': {
      padding: '5px',
      borderRadius: '3'
    }
  })

  props = { value: new rx.Prop('') };

  render = () => [
    h.input({ fields: { ...this.props }, events: {
      change: e => {
        this.props.value.next((e.target as HTMLInputElement).value);
      }
    }})
  ]
}
Input.register();
