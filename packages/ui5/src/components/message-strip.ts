import { TemplateElement } from "@mvuijs/core";
import { default as Ui5MessageStrip } from "@ui5/webcomponents/dist/MessageStrip";
import "@ui5/webcomponents/dist/MessageStrip.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-message-strip--docs
 )
 */
export const messageStrip = TemplateElement.fromCustom<Ui5MessageStrip, {
  slots: {
    default: any,
    icon: any,
  },
  events: {
    close: CustomEvent,
  }
}>(() => document.createElement('ui5-message-strip') as any);
