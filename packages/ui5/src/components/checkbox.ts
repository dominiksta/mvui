import { TemplateElement } from "@mvuijs/core";
import Ui5CheckBox from "@ui5/webcomponents/dist/CheckBox";
import "@ui5/webcomponents/dist/CheckBox.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-checkbox--docs
 )
 */
export const checkbox = TemplateElement.fromCustom<Ui5CheckBox, {
  events: {
    change: CustomEvent,
  }
}
>(() => document.createElement('ui5-checkbox') as any);


