import { Component, define, h, rx, style } from "@mvui/core";
import { TemplateElementChild } from "@mvui/core";
import theme from "theme";

const CONTENT = new rx.State<TemplateElementChild | undefined>(undefined);

let currentTimeout: any;

/**
 * Open the snackbar with a given string or template for `timeoutMs` ms.
 */
export function openSnackbar(
  content: TemplateElementChild,
  timeoutMs: number = 2000,
) {
  if (currentTimeout) clearTimeout(currentTimeout);
  currentTimeout = setTimeout(() => CONTENT.next(undefined), timeoutMs);
  CONTENT.next(content);
}

/**
   A snackbar for simple "toast" notifications.

   ### Example
   ```typescript
   import * as std from '@mvui/stdlib';

   class Main extends Component {
     render = () => [
       // put this anywhere, position really does not matter
       std.snackbar(),
     ]
   }

   // you can display
   std.openSnackbar('Some Text');
   std.openSnackbar(h.div('Or a template'));
   ```
 */
export class Snackbar extends Component {

  render() {
    return [
      h.div(
        {
          attrs: { id: 'snackbar' },
          style: {
            display: CONTENT.select(c => c === undefined ? 'none' : 'flex')
          }
        },[
          h.div({ attrs: { id: 'text' }}, CONTENT),
          h.button({
            events: { click: _ => CONTENT.next(undefined) },
          }, 'X')
        ]
      )
    ]
  }

  static styles = style.sheet({
    '#snackbar': {
      position: 'fixed',
      border: `3px solid ${theme.fgContrastMiddle}`,
      background: theme.bg,
      color: theme.fg,
      padding: '0.5em',
      bottom: '2em',
      right: '2em',
    },
    'button': {
      background: 'none',
      border: 'none',
      color: theme.fg,
      fontFamily: 'monospace',
      marginLeft: '0.5em',
    },
    'button:hover': {
      color: 'red',
    },
  });
};

export const [snackbar] = define(Snackbar);
