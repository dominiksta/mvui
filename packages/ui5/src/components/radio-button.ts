import { TemplateElement } from "@mvuijs/core";
import Ui5RadioButton from "@ui5/webcomponents/dist/RadioButton";
import "@ui5/webcomponents/dist/RadioButton.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-progress-indicator--docs
 )
 */
export const radioButton = TemplateElement.fromCustom<Ui5RadioButton, {
  events: {
    change: CustomEvent
  }
}
>(() => document.createElement('ui5-radio-button') as any);
