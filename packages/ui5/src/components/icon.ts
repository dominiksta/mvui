import { TemplateElement } from "@mvuijs/core";
import Ui5Icon from "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents/dist/Icon.js";

import "@ui5/webcomponents-icons/dist/AllIcons.js";
import "@ui5/webcomponents-icons-tnt/dist/AllIcons.js";
import "@ui5/webcomponents-icons-business-suite/dist/AllIcons.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-icon--docs
 )
 */
export const icon = TemplateElement.fromCustom<Ui5Icon, {
}
>(() => document.createElement('ui5-icon') as any);


