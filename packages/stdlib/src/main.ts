import { Component, h, MVUI_GLOBALS, rx, style } from "@mvui/core";
import theme, { darkTheme, lightTheme, MVUI_STDLIB_THEME_NAME } from "theme";
import * as std from "./index";

style.currentTheme$.subscribe(theme => {
  style.setTheme(
    MVUI_STDLIB_THEME_NAME, theme === 'dark' ? darkTheme : lightTheme
  );
});

MVUI_GLOBALS.APP_DEBUG = false;

class Main extends Component {
  #state = new rx.State('initial');

  static useShadow = false;
  static styles = style.sheet({
    'app-main': {
      display: 'block',
    },
    'html': {
      background: theme.bg,
      color: theme.fg,
      fontFamily: theme.font,
    },
    'std-collapsible': {
      marginBottom: '10px',
    },
  });

  render = () => [
    h.h1('Test Page'),
    std.snackbar(),
    std.collapsible([
      h.span({attrs: { slot: 'header' }}, 'Buttons'),
      std.button('Default'),
      std.button({ props: { kind: 'primary' } }, 'Primary'),
      std.button({ props: { kind: 'accent' } }, 'Accent'),
    ]),
    std.collapsible([
      h.span({attrs: { slot: 'header' }}, 'Snackbar'),
      std.button(
        { events: { click: _ => std.openSnackbar('Text 1') }},
        'Trigger with Text 1'
      ),
      std.button(
        { events: { click: _ => std.openSnackbar('Text 2') }},
        'Trigger with Text 2'
      ),
      std.button(
        { events: { click: _ => std.openSnackbar(std.collapsible([
          h.span({attrs: { slot: 'header'}}, 'header'),
          h.div('content')
        ]), 5000) }},
        'Trigger with Custom Elements'
      ),
    ]),
    std.collapsible([
      h.span({attrs: { slot: 'header' }}, 'Bindings Test'),
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
