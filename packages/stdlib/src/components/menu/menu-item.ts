import { Component, h, style } from "@mvui/core";
import { menuContext, STYLE_MENU_ITEM } from './menu';

/**
   A MenuItem only makes sense in the context of a Menu (which see).

   ### Usage

   ```typescript
   // ...
   render() {
     return [
       std.Menu.t([
         std.MenuItem.t('Menu 1 Item 1'),
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
     ]
   }
   ```

   @class MenuItem

   @fires {MouseEvent} click

   @slot {any} default
 */
@Component.register
export class MenuItem extends Component<{
  slots: {
    right: HTMLDivElement
  }
}> {
  static tagNameLibrary = 'std';

  render() {
    console.log('menu-item');
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
};
