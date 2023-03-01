import { Component, rx, h, style, define } from "@mvui/core";
import theme from "theme";

/**
 * Some general doc
 */
export const [input, Input] = define(class Input extends Component {
  static tagNameLibrary = 'std';

  static styles = style.sheet({
    'input': {
      fontFamily: theme.font,
      background: theme.bgContrast10,
      color: theme.fg,
      border: 'none',
      borderBottom: `1px solid ${theme.fg}`,
      padding: '5px',
      margin: '1px',
    },
  });

  props = {
    /**
     * @prop {string} The value entered
     */
    value: new rx.Prop(''),
    /**
     * @prop {boolean} The value entered
     */
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
})
