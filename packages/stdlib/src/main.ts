import { Component, h, rx, style } from "@mvui/core";
import theme, { darkTheme, lightTheme, MVUI_STDLIB_THEME_NAME } from "theme";
import * as std from "./index";

style.currentTheme$.subscribe(theme => {
  style.setTheme(
    MVUI_STDLIB_THEME_NAME, theme === 'dark' ? darkTheme : lightTheme
  );
});

class Main extends Component {
  #state = new rx.State('initial');

  static useShadow = false;
  static styles = style.sheet({
    'html': {
      background: theme.bg,
      color: theme.fg,
      fontFamily: theme.font,
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
      h.p([
        'Cras placerat accumsan nulla.  Nullam tempus.',
        'Nullam tristique diam non turpis.  Phasellus lacus.  ',
        'Nam vestibulum accumsan nisl.  Nullam tristique diam non turpis.  ',
        'Nullam tristique diam non turpis.  ',
      ]),
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
      std.button({ events: { click: _ => this.#state.next('intial') } }, 'reset'),
    ])
  ]
}
Main.register();

document.body.appendChild(new Main());
