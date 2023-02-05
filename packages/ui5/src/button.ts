import { TemplateElement } from "@mvui/core";
import { default as Ui5Button } from "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents/dist/Button.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Button/
 )
 <iframe class="ui5"
  src="https://sap.github.io/ui5-webcomponents/playground/components/Button/"></iframe>
 */
export const button = TemplateElement.fromCustom<Ui5Button,
  {
    click: void
  }
>(() => document.createElement('ui5-button') as any);
