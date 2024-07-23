import { TemplateElement } from "@mvuijs/core";
import Ui5ResponsivePopover from "@ui5/webcomponents/dist/ResponsivePopover";
import "@ui5/webcomponents/dist/ResponsivePopover.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-responsive-popover--docs
 )
 */
export const responsivePopover = TemplateElement.fromCustom<Ui5ResponsivePopover, {
  slots: {
    default: any,
    footer: any,
    header: any,
  },
  events: {
    'after-close': CustomEvent,
    'after-open': CustomEvent,
    'before-close': CustomEvent<{ escPressed: boolean }>,
    'before-open': CustomEvent,
  }
}
>(() => document.createElement('ui5-responsive-popover') as any);
