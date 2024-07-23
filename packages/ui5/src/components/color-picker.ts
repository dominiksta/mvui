import { TemplateElement } from "@mvuijs/core";
import Ui5ColorPicker from "@ui5/webcomponents/dist/ColorPicker";
import "@ui5/webcomponents/dist/ColorPicker.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-colorpicker--docs
 )
 */
export const colorPicker = TemplateElement.fromCustom<Ui5ColorPicker, {
  events: {
    change: CustomEvent
  },
  slots: {
    default: HTMLElement,
  }
}
>(() => document.createElement('ui5-color-picker') as any);
