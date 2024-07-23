import { TemplateElement } from "@mvuijs/core";
import Ui5Label from "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Label.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-label--docs
 )
 */
export const label = TemplateElement.fromCustom<Ui5Label, {
  slots: {
    default: any,
  }
}
>(() => document.createElement('ui5-label') as any);


