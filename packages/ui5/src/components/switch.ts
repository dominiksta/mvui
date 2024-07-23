import { TemplateElement } from "@mvuijs/core";
import Ui5Switch from "@ui5/webcomponents/dist/Switch";
import "@ui5/webcomponents/dist/Switch.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-switch--docs
 )
 */
export const switchToggle = TemplateElement.fromCustom<Ui5Switch, {
  events: {
    change: CustomEvent,
  }
}
>(() => document.createElement('ui5-switch') as any);
