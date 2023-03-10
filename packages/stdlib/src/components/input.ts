import { Component, rx, h, style, define } from "@mvui/core";
import { theme } from "theme";

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
export class Input extends Component {
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
      borderTop: `1px solid ${theme.bgContrastMiddle}`,
      borderRight: `1px solid ${theme.bgContrastMiddle}`,
      borderLeft: `1px solid ${theme.bgContrastMiddle}`,
      borderBottom: `1px solid ${theme.fg}`,
      padding: '5px',
      marginRight: '5px',
      marginBottom: '5px',
    },
    'input:focus': {
      border: `1px solid ${theme.fg}`,
      outline: 'none',
    }
  });

  props = {
    value: new rx.Prop('', { reflect: true }),
    onlyEmitOnBlur: new rx.Prop(false, { reflect: true, converter: Boolean }),
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
}

export const [ input ] = define(Input);
