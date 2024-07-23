import { TemplateElement } from "@mvuijs/core";
import Ui5SplitButton from "@ui5/webcomponents/dist/SplitButton";
import "@ui5/webcomponents/dist/SplitButton.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-splitButton--docs
 )
 */
export const splitButton = TemplateElement.fromCustom<Ui5SplitButton, {
  events: {
    click: CustomEvent,
    'arrow-click': CustomEvent,
  }
}
>(() => document.createElement('ui5-split-button') as any);
