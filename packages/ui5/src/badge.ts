import { TemplateElement } from "@mvui/core";
import { default as Ui5Badge } from "@ui5/webcomponents/dist/Badge";
import "@ui5/webcomponents/dist/Badge.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Badge/
 )
 <iframe class="ui5"
 src="https://sap.github.io/ui5-webcomponents/playground/components/Badge/">
 </iframe>
 */
export const badge = TemplateElement.fromCustom<Ui5Badge,
  {}
>(() => document.createElement('ui5-badge') as any)
