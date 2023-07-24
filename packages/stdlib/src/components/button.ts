import { Component, h, rx, style } from "@mvui/core";
import { theme } from "theme";

/**
   This is a really cool button.

   ### Usage
   ```typescript
   import * as std from '@mvui/stdlib';

   class Example extends Component {
     render = () => [
       std.Button.t('Click Me!'),
     ]
   }
   ```

   @class Button

   @fires {CustomEvent<MouseEvent>} click -
   Dispatched after use clicked the button

   @attr kind
   @prop {'primary' | 'accent' | 'default'} [kind='default'] -
   The basic design of this button

   @csspart button - The native button element

   @slot {any} default
 */
@Component.register
export class Button extends Component<{
  events: {
    click: MouseEvent
  },
}> {
  static tagNameLibrary = 'std';

  protected static styles = style.sheet({
    ':host': {
      display: 'inline-block',
      marginRight: '5px',
      marginBottom: '5px',
    },
    'button': {
      fontFamily: theme.font,
      background: theme.bg,
      color: theme.fg,
      width: '100%',
      border: `2px solid ${theme.fg}`,
      padding: '3px 5px',
      fontWeight: '500',
    },
    'button:hover': {
      outline: `1px solid ${theme.fg}`,
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
            click: e => {
              this.reDispatch('click', e);
            }
          },
          attrs: {
            class: this.props.kind,
            part: 'button',
          }
        },
        h.slot()
      )
    ]
  }
}
