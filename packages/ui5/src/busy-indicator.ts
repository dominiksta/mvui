import { TemplateElement } from "@mvui/core";
import { default as Ui5BusyIndicator } from "@ui5/webcomponents/dist/BusyIndicator";
import "@ui5/webcomponents/dist/BusyIndicator.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/BusyIndicator/
 )
 <iframe class="ui5"
 src="https://sap.github.io/ui5-webcomponents/playground/components/BusyIndicator/">
 </iframe>
 */
export const busyIndicator = TemplateElement.fromCustom<Ui5BusyIndicator,
  {}
>(() => document.createElement('ui5-busy-indicator') as any);
