import { Component, define, h, style } from "@mvui/core";
import { menuContext, STYLE_MENU_ITEM } from './menu';

/**
   An arbitrarily nested menu. Unlinke traditional desktop context menus, the nested menus
   do not appear separately and instead appear in place, making this more suitable for
   mobile use. See also MenuItem.

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

   @class MenuItem

   @fires {MouseEvent} click

   @slot {any} default
 */
export const [menuitem, MenuItem] = define(class MenuItem extends Component<{
  slots: {
    right: HTMLDivElement
  }
}> {
  static tagNameLibrary = 'std';

  render() {
    const ctx = this.getContext(menuContext);
    const hidden = ctx.derive(v => v.active !== this.parentElement);

    return [
      h.div({
        fields: { hidden },
        classes: { 'menu-item': true },
      }, [
        h.button({
          // events: { click: e => this.reDispatch('click', e) },
        }, [
          h.span({ attrs: { id: 'text' }}, h.slot()),
          h.span({ attrs: { id: 'right' }}, h.slot({ attrs: { name: 'right' }})),
        ])
      ]),
    ];
  }


  static styles = style.sheet({
    ...STYLE_MENU_ITEM,
    ':host': {
      display: 'block',
    }
  });
});
