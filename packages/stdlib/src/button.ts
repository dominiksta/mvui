import { Component, define, h, rx, style } from "@mvui/core";
import { Newable } from "@mvui/core/dist/types/util/types";
import theme from "theme";

/**
 * This is a really cool button.
 *
 * @example
 * ```typescript
 * import * as std from '@mvui/stdlib';
 *
 * class Example extends Component {
 *   render = () => [
 *     std.button.new('Click Me!'),
 *   ]
 * }
 * ```
 */
export const [button, Button] = define(class Button extends Component<{
  click: MouseEvent
}> {
  static tagNameLibrary = 'std';

  static styles = style.sheet({
    'button': {
      fontFamily: theme.font,
      background: theme.bg,
      color: theme.fg,
      border: `2px solid ${theme.fg}`,
      padding: '3px 5px',
      margin: '1px',
      fontWeight: 'bold',
    },
    'button:active': {
      background: theme.fg,
      color: theme.bg,
    },
    '.primary': {
      color: 'white',
      background: theme.primary,
    },
    '.primary:active': {
      color: theme.primary,
      background: 'white',
    },
    '.accent': {
      color: 'white',
      background: theme.accent,
    },
    '.accent:active': {
      color: theme.accent,
      background: 'white',
    },
  })

  props = {
    kind: new rx.Prop<
      'default' | 'primary' | 'accent'
    >('default', { reflect: true }),
  }

  render() {
    return [
      h.button(
        {
          events: {
            click: e => this.dispatch('click', e)
          },
          attrs: { class: this.props.kind }
        },
        h.slot()
      )
    ]
  }
})
