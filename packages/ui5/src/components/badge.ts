import { TemplateElement } from "@mvuijs/core";
import { default as Ui5Badge } from "@ui5/webcomponents/dist/Badge";
import "@ui5/webcomponents/dist/Badge.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-badge--docs
 )
 */
export const badge = TemplateElement.fromCustom<Ui5Badge, {
}>(() => document.createElement('ui5-badge') as any)
