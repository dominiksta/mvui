import { TemplateElement } from "@mvui/core";
import { default as Ui5Input } from "@ui5/webcomponents/dist/Input";
import "@ui5/webcomponents/dist/Input.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Input/
 )
 <iframe class="ui5"
  src="https://sap.github.io/ui5-webcomponents/playground/components/Input/"></iframe>
 */
export const input = TemplateElement.fromCustom<Ui5Input, {
  events: {
    change: void
    input: void
    'suggestion-item-previer': {
      item: HTMLElement, // TODO: probably another type
      targetRef: HTMLElement
    },
    'suggestion-item-select': {
      item: HTMLElement
    }
  }
}>(() => document.createElement('ui5-input') as any);
