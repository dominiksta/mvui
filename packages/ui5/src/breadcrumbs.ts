import { TemplateElement } from "@mvui/core";
import { default as Ui5Breadcrumbs } from "@ui5/webcomponents/dist/Breadcrumbs";
import "@ui5/webcomponents/dist/Breadcrumbs.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/Breadcrumbs/
 )
 <iframe class="ui5"
 src="https://sap.github.io/ui5-webcomponents/playground/components/Breadcrumbs/">
 </iframe>
 */
export const breadcrumbs = TemplateElement.fromCustom<Ui5Breadcrumbs,
  {
    'item-click': {
      item: HTMLElement,
      altKey: boolean, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean,
    }
  }
>(() => document.createElement('ui5-breadcrumbs') as any);
