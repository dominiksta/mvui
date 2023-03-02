import { Component, rx, h, style, define } from "@mvui/core";
import theme from "theme";

/**
 * Some general doc
 * @class Input
 *
 * @prop {string} value -
 * The user provided value
 *
 * @prop {boolean} [onlyEmitonBlur=false] -
 * Wether to only emit new values when focus is lost
 *
 * TODO: maybe make onlyEmitOnBlur an option for rx.bind ?
 */
export const [input, Input] = define(class Input extends Component {
  static tagNameLibrary = 'std';

  static styles = style.sheet({
    ':host': {
      display: 'inline-block',
    },
    'input': {
      fontFamily: theme.font,
      background: theme.bgContrastMiddle,
      color: theme.fg,
      border: 'none',
      borderBottom: `1px solid ${theme.fg}`,
      padding: '5px',
      margin: '1px',
    },
  });

  props = {
    value: new rx.Prop(''),
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
