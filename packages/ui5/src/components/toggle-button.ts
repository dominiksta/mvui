import { TemplateElement } from "@mvuijs/core";
import Ui5ToggleButton from "@ui5/webcomponents/dist/ToggleButton";
import "@ui5/webcomponents/dist/ToggleButton.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toggle-button--docs
 )
 */
export const toggleButton = TemplateElement.fromCustom<Ui5ToggleButton, {
  events: {
    click: MouseEvent,
  }
}
>(() => document.createElement('ui5-toggle-button') as any);
