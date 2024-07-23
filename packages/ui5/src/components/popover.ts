import { TemplateElement } from "@mvuijs/core";
import Ui5Popover from "@ui5/webcomponents/dist/Popover";
import "@ui5/webcomponents/dist/Popover.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-popover--docs
 )
 */
export const popover = TemplateElement.fromCustom<Ui5Popover, {
  events: {
    'after-close': CustomEvent,
    'after-open': CustomEvent,
    'before-close': CustomEvent<{ escPressed: boolean }>,
    'before-open': CustomEvent,
  },
  slots: {
    default: any,
    footer: any,
    header: any,
  }
}
>(() => document.createElement('ui5-popover') as any);
