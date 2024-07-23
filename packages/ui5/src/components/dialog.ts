import { TemplateElement } from "@mvuijs/core";
import Ui5Dialog from "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Dialog.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-dialog--docs
 )
 */
export const dialog = TemplateElement.fromCustom<Ui5Dialog, {
  slots: {
    default: any,
    footer: any,
    header: any,
  },
  events: {
    'after-close': CustomEvent,
    'after-open': CustomEvent,
    'before-close': CustomEvent<{escPressed: boolean}>,
    'before-open': CustomEvent,
  }
}
>(() => document.createElement('ui5-dialog') as any);


