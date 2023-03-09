import { Component, define, h, rx, style } from "@mvui/core";
import theme from "theme";

export const menuContext = new rx.Context(() => new rx.State<{
  active: Menu | null
}>({
  active: null
}));

export const STYLE_MENU_ITEM = {
  '.menu-item': {
    minWidth: '7em',
  },
  '.menu-item > button': {
    height: '2em',
    textAlign: 'left',
    padding: '0.2em',
    margin: '0',
    background: theme.bg,
    color: theme.fg,
    border: 'none',
    borderTop: `2px solid ${theme.fg}`,
    borderLeft: `2px solid ${theme.fg}`,
    borderRight: `2px solid ${theme.fg}`,
    width: '100%',
  },
  '.menu-item > button .right': {
    float: 'right',
    marginLeft: '2em',
  },
  '.menu-item > button:hover': {
    background: theme.bgContrastMiddle,
  },
  '.menu-item > button:active': {
    background: theme.fg,
    color: theme.bg,
  },
  '.active': {
    borderBottom: `2px solid ${theme.fg}`,
  }
}

/**
   A MenuItem only makes sense in the context of a Menu (which see).

   ### Example

   ```typescript
   // ...
   render() {
     return [
       std.menu([
         std.menuitem('Menu 1 Item 1'),
         std.menuitem('Menu 1 Item 2'),
         std.menu({ props: { text: 'Submenu 1' }}, [
           std.menuitem('Submenu 1 Item 1'),
           std.menu({ props: { text: 'SubSubmenu 1' } }, [
             std.menuitem('SubSubmenu 1 Item 1'),
             std.menuitem('SubSubmenu 1 Item 2'),
           ]),
           std.menuitem('Submenu 1 Item 2'),
         ]),
         std.menuitem('Menu 1 Item 3'),
       ]),
     ]
   }
   ```

   @class Menu

   @fires {MouseEvent} click

   @prop {TemplateElementChild} text -
   If this menu is a submenu, this text will be displayed as the name of the submenu

   @slot {MenuItem} default
 */
export class Menu extends Component {
  static tagNameLibrary = 'std';

  props = {
    text: new rx.Prop(''),
  }

  
  render() {
    // warning: recursive context magic incoming

    // the top most menu element will provide the context
    const ctx = this.parentElement instanceof Menu
      ? this.getContext(menuContext)
      : this.provideContext(menuContext);

    // the top most menu element is active by default
    if (ctx.value.active === null) ctx.next({active: this});

    const hideNest = ctx.derive(
      v => v.active !== this.parentElement || !(this.parentElement instanceof Menu)
    );
    const hideBack = ctx.derive(
      v => v.active !== this || !(this.parentElement instanceof Menu)
    );

    return [
      h.div({
        attrs: { id: '#content' },
        classes: { active: ctx.derive(v => v.active === this )},
      }, [
        h.div(
          { classes: { 'menu-item': true }},
          h.button({
            classes: { 'menu-item': true },
            fields: { hidden: hideNest },
            events: {
              click: _ => {
                ctx.next({ active: this });
                console.log('setting active', this);
              }
            }
          }, [
            h.span({ classes: { 'text': true } }, this.props.text),
            // BLACK RIGHT-POINTING SMALL TRIANGLE
            h.span({ classes: { 'right': true } }, '▸'),
          ]),
        ),

        h.div(
          { classes: { 'menu-item': true } },
          h.button({
            fields: { hidden: hideBack },
            events: {
              click: _ => {
                if (this.parentElement instanceof Menu)
                  ctx.next({ active: this.parentElement });
              },
            }
          }, [
            // BLACK LEFT-POINTING SMALL TRIANGLE
            h.span({ classes: { 'mark': true } }, '◂'),
            h.span({ classes: { 'text': true } }, 'Back'),
          ]),
        ),

        h.menu(h.slot()),
      ])
    ];
  }


  static styles = style.sheet({
    ':host': {
      display: 'flex',
    },
    'menu': {
      padding: '0',
      margin: '0',
    },
    ...STYLE_MENU_ITEM,
  });

};

export const [menu] = define(Menu);
