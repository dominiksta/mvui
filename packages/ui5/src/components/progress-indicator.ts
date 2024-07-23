import { TemplateElement } from "@mvuijs/core";
import Ui5ProgressIndicator from "@ui5/webcomponents/dist/ProgressIndicator";
import "@ui5/webcomponents/dist/ProgressIndicator.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-progress-indicator--docs
 )
 */
export const progressIndicator = TemplateElement.fromCustom<Ui5ProgressIndicator, {
}
>(() => document.createElement('ui5-progress-indicator') as any);
