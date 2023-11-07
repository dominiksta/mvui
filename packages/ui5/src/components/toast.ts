import { TemplateElement } from "@mvui/core";
import "@ui5/webcomponents/dist/Toast";
import ToastPlacement from "@ui5/webcomponents/dist/types/ToastPlacement";
import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";

export declare class Toast extends UI5Element {
  duration: number;
  placement: ToastPlacement;
  show(): void;
}

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Toast/
 )
 */
export const toast = TemplateElement.fromCustom<Toast, {
}>(() => document.createElement('ui5-toast') as any);
