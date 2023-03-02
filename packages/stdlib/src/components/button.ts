import { Component, define, h, rx, style } from "@mvui/core";
import { Newable } from "@mvui/core/dist/types/util/types";
import theme from "theme";

/**
 * This is a really cool button.
 *
 * ### Example
 * ```typescript
 * import * as std from '@mvui/stdlib';
 *
 * class Example extends Component {
 *   render = () => [
 *     std.button('Click Me!'),
 *   ]
 * }
 * ```
 *
 * @class Button
 *
 * @fires {CustomEvent<MouseEvent>} click -
 * Dispatched after use clicked the button
 *
 * @attr kind
 * @prop {'primary' | 'accent' | 'default'} [kind='default'] -
 * The basic design of this button
 *
 * @slot {HTMLElement} default
 */
export class Button extends Component<{
  click: MouseEvent
}> {
  static tagNameLibrary = 'std';

  protected static styles = style.sheet({
    'button': {
      fontFamily: theme.font,
      background: theme.bg,
      color: theme.fg,
      border: `2px solid ${theme.fg}`,
      padding: '3px 5px',
      margin: '1px',
      fontWeight: '500',
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

  /** @ignore */
  props = {
    kind: new rx.Prop<
      'default' | 'primary' | 'accent'
    >('default', { reflect: true }),
  }

  /**
   * Description
   * @function docTest
   * @param {string} str - ye
   * @returns {void}
   */
  public docTest(str: string) {
    
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
}

export const [button] = define(Button);
