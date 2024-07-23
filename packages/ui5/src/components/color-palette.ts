import { TemplateElement } from "@mvuijs/core";
import Ui5ColorPalette from "@ui5/webcomponents/dist/ColorPalette";
import Ui5ColorPaletteItem from "@ui5/webcomponents/dist/ColorPaletteItem";
import Ui5ColorPalettePopover from "@ui5/webcomponents/dist/ColorPalettePopover";
import "@ui5/webcomponents/dist/ColorPalette.js";
import "@ui5/webcomponents/dist/ColorPaletteItem.js";
import "@ui5/webcomponents/dist/ColorPalettePopover.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-colorpalette--docs
 )
 */
export const colorPalette = TemplateElement.fromCustom<Ui5ColorPalette, {
  events: {
    'item-click': CustomEvent<{
      color: string,
    }>
  },
  slots: {
    default: Ui5ColorPaletteItem,
  }
}
>(() => document.createElement('ui5-color-palette') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-colorpalette--docs
 )
 */
export const colorPaletteItem = TemplateElement.fromCustom<Ui5ColorPaletteItem, {
}
>(() => document.createElement('ui5-color-palette-item') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-colorpalettepopover--docs
 )
 */
export const colorPalettePopover = TemplateElement.fromCustom<Ui5ColorPalettePopover, {
  events: {
    'item-click': CustomEvent<{
      color: string,
    }>
  },
  slots: {
    default: Ui5ColorPaletteItem,
  }
}
>(() => document.createElement('ui5-color-palette-popover') as any);
