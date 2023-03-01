import { Component, h, rx, style } from "@mvui/core";
import theme, { darkTheme, lightTheme } from "theme";
import * as std from "./index";

style.currentTheme$.subscribe(theme => {
  if (theme === 'dark')
    style.setTheme('mvui-stdlib', darkTheme);
  if (theme === 'light')
    style.setTheme('mvui-stdlib', lightTheme);
})

class Main extends Component {
  #state = new rx.State('initial');

  static useShadow = false;
  static styles = style.sheet({
    'html': {
      background: theme.bg,
      color: theme.fg,
    }
  });

  render = () => [
    h.fieldset([
      h.legend('buttons'),
      std.button('Default'),
      std.button({ props: { kind: 'primary' } }, 'Primary'),
      std.button({ props: { kind: 'accent' } }, 'Accent'),
    ]),
    h.fieldset([
      h.legend('bindings test'),
      std.input({ props: { value: rx.bind(this.#state) } }),
      std.input({
        styleOverrides: style.sheet({
          'input': {
            fontFamily: 'monospace',
          }
        }),
        props: {
          value: rx.bind(this.#state),
        }
      }),
      h.input({ fields: { value: rx.bind(this.#state) } }),
      h.div(this.#state),
      std.button({ events: { click: _ => this.#state.next('intial') } }, 'reset'),
    ])
  ]
}
Main.register();

document.body.appendChild(new Main());
