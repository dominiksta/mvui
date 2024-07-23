import { TemplateElement } from "@mvuijs/core";
import Ui5Menu from "@ui5/webcomponents/dist/Menu";
import Ui5MenuItem from "@ui5/webcomponents/dist/MenuItem";
import "@ui5/webcomponents/dist/Menu.js";
import "@ui5/webcomponents/dist/MenuItem.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-menu--docs
 )
 */
export const menu = TemplateElement.fromCustom<Ui5Menu, {
  slots: {
    default: Ui5MenuItem,
  },
  events: {
    'after-close': CustomEvent,
    'after-open': CustomEvent,
    'before-close': CustomEvent<{escPressed: boolean}>,
    'item-click': CustomEvent<{item: Ui5MenuItem, text: string}>,
  }
}
>(() => document.createElement('ui5-menu') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-menu--docs
 )
 */
export const menuItem = TemplateElement.fromCustom<Ui5MenuItem, {
  slots: {
    default: any,
  },
}
>(() => document.createElement('ui5-menu-item') as any);

