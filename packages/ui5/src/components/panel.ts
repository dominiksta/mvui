import { TemplateElement } from "@mvuijs/core";
import Ui5Panel from "@ui5/webcomponents/dist/Panel";
import "@ui5/webcomponents/dist/Panel.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-panel--docs
 )
 */
export const panel = TemplateElement.fromCustom<Ui5Panel, {
  events: {
    toggle: CustomEvent<void>,
  },
  slots: {
    default: HTMLElement,
    header: HTMLElement,
  }
}
>(() => {
  const el = document.createElement('ui5-panel') as Ui5Panel;
  el.noAnimation = true; // I think they really need to work on their transitions
  return el;
});
