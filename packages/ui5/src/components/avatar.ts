import { TemplateElement } from "@mvuijs/core";
import { default as Ui5Avatar } from "@ui5/webcomponents/dist/Avatar";
import "@ui5/webcomponents/dist/Avatar.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-avatar--docs
 )
 */
export const avatar = TemplateElement.fromCustom<Ui5Avatar, {
}>(() => document.createElement('ui5-avatar') as any);
