import { TemplateElement } from "@mvuijs/core";
import { default as Ui5Button } from "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents/dist/Button.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-button--docs
 )
 */
export const button = TemplateElement.fromCustom<Ui5Button, {
  events: {
    click: MouseEvent,
  }
}
>(() => document.createElement('ui5-button') as any);
