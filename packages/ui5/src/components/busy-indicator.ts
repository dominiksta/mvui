import { TemplateElement } from "@mvuijs/core";
import { default as Ui5BusyIndicator } from "@ui5/webcomponents/dist/BusyIndicator";
import "@ui5/webcomponents/dist/BusyIndicator.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-busy-indicator--docs
 )
 */
export const busyIndicator = TemplateElement.fromCustom<Ui5BusyIndicator,
  {}
>(() => document.createElement('ui5-busy-indicator') as any);
