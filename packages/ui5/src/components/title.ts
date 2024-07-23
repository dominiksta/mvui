import { TemplateElement } from "@mvuijs/core";
import Ui5Title from "@ui5/webcomponents/dist/Title";
import "@ui5/webcomponents/dist/Title.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-title--docs
 )
 */
export const title = TemplateElement.fromCustom<Ui5Title, {
}
>(() => document.createElement('ui5-title') as any);
