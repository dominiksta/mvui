import { TemplateElement } from "@mvuijs/core";
import Ui5Link from "@ui5/webcomponents/dist/Link";
import "@ui5/webcomponents/dist/Link.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-link--docs
 )
 */
export const link = TemplateElement.fromCustom<Ui5Link, {
  slots: {
    default: any,
  },
  events: {
    click: CustomEvent<{
      altKey: boolean,
      ctrlKey: boolean,
      metaKey: boolean,
      shiftKey: boolean,
    }>
  }
}
>(() => document.createElement('ui5-link') as any);


