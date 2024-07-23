import { TemplateElement } from "@mvuijs/core";
import Ui5Select from "@ui5/webcomponents/dist/Select";
import Ui5Option from "@ui5/webcomponents/dist/Option";
import Ui5SelectMenu from "@ui5/webcomponents/dist/SelectMenu";
import Ui5SelectMenuOption from "@ui5/webcomponents/dist/SelectMenuOption";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/SelectMenu.js";
import "@ui5/webcomponents/dist/SelectMenuOption.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-select--docs
 )
 */
export const select = TemplateElement.fromCustom<Ui5Select, {
  slots: {
    default: Ui5Option,
    label: any,
    valueStateMessage: any,
  },
  events: {
    change: CustomEvent<{ selectedOption: Ui5Option }>,
    close: CustomEvent,
    'live-change': CustomEvent<{ selectedOption: Ui5Option }>,
    open: CustomEvent,
  }
}
>(() => document.createElement('ui5-select') as any);

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-select--docs
 )
 */
export const option = TemplateElement.fromCustom<Ui5Option, {
  slots: {
    default: any,
  }
}
>(() => document.createElement('ui5-option') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-select--docs
 )
 */
export const selectMenu = TemplateElement.fromCustom<Ui5SelectMenu, {
  slots: {
    default: any,
  }
}
>(() => document.createElement('ui5-select-menu') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-select--docs
 )
 */
export const selectMenuOption = TemplateElement.fromCustom<Ui5SelectMenuOption, {
  slots: {
    default: any,
    deleteButton: any,
  }
}
>(() => document.createElement('ui5-select-menu-option') as any);
