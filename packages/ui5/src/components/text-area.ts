import { TemplateElement } from "@mvuijs/core";
import Ui5TextArea from "@ui5/webcomponents/dist/TextArea";
import "@ui5/webcomponents/dist/TextArea.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-text-area--docs
 )
 */
export const textarea = TemplateElement.fromCustom<Ui5TextArea, {
  events: {
    change: CustomEvent,
    input: CustomEvent,
  },
  slots: {
    valueStateMessage: any
  }
}
>(() => document.createElement('ui5-textarea') as any);


