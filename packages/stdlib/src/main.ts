import { Component, h, MVUI_GLOBALS, rx, style } from "@mvui/core";
import { theme, darkTheme, lightTheme, MVUI_STDLIB_THEME_NAME } from "theme";
import * as std from "./index";

style.currentTheme$.subscribe(theme => {
  style.setTheme(
    MVUI_STDLIB_THEME_NAME, theme === 'dark' ? darkTheme : lightTheme
  );
});

MVUI_GLOBALS.APP_DEBUG = false;

@Component.register
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
    std.Snackbar.t(),
    std.Collapsible.t([
      h.span({attrs: { slot: 'header' }}, 'Buttons'),
      std.Button.t('Default'),
      std.Button.t({ props: { kind: 'primary' } }, 'Primary'),
      std.Button.t({ props: { kind: 'accent' } }, 'Accent'),
    ]),
    std.Collapsible.t([
      h.span({ attrs: { slot: 'header' } }, 'Menus'),
      std.Menu.t({ props: { text: 'Menu 1 (should not display)' }}, [
        std.MenuItem.t({ slots: { right: [h.div('')] }}, 'Menu 1 Item 1'),
        std.MenuItem.t('Menu 1 Item 2'),
        std.Menu.t({ props: { text: 'Submenu 1' }}, [
          std.MenuItem.t('Submenu 1 Item 1'),
          std.Menu.t({ props: { text: 'SubSubmenu 1' } }, [
            std.MenuItem.t('SubSubmenu 1 Item 1'),
            std.MenuItem.t('SubSubmenu 1 Item 2'),
          ]),
          std.MenuItem.t('Submenu 1 Item 2'),
        ]),
        std.MenuItem.t('Menu 1 Item 3'),
      ]),
      h.br(),
    ]),
    std.Collapsible.t([
      h.span({ attrs: { slot: 'header' } }, 'Snackbar'),
      std.Button.t(
        { events: { click: _ => std.openSnackbar('Text 1') } },
        'Trigger with Text 1'
      ),
      std.Button.t(
        { events: { click: _ => std.openSnackbar('Text 2') } },
        'Trigger with Text 2'
      ),
      std.Button.t(
        {
          events: {
            click: _ => std.openSnackbar(std.Collapsible.t([
              h.span({ attrs: { slot: 'header' } }, 'header'),
              h.div('content')
            ]), 5000)
          }
        },
        'Trigger with Custom Elements'
      ),
    ]),
    std.Collapsible.t([
      h.span({ attrs: { slot: 'header' } }, 'Bindings Test'),
      h.p([
        'Cras placerat accumsan nulla.  Nullam tempus.',
        'Nullam tristique diam non turpis.  Phasellus lacus.  ',
        'Nam vestibulum accumsan nisl.  Nullam tristique diam non turpis.  ',
        'Nullam tristique diam non turpis.  ',
      ]),
      std.Input.t({ props: { value: rx.bind(this.#state) } }),
      std.Input.t({
        styleOverrides: style.sheet({
          'input': {
            fontFamily: 'monospace',
          }
        }),
        props: {
          value: rx.bind(this.#state),
        }
      }),
      std.Button.t({ events: { click: _ => this.#state.next('intial') } }, 'reset'),
    ]),
  ]
}

document.body.appendChild(new Main());
