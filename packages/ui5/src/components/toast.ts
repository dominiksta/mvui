import { TemplateElement } from "@mvuijs/core";
import Toast from "@ui5/webcomponents/dist/Toast";
import "@ui5/webcomponents/dist/Toast.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Toast/
 )
 */
export const toast = TemplateElement.fromCustom<Toast, {
}>(() => document.createElement('ui5-toast') as any);
