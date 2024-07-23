import { TemplateElement } from "@mvuijs/core";
import Ui5Card from "@ui5/webcomponents/dist/Card";
import Ui5CardHeader from "@ui5/webcomponents/dist/CardHeader";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-card--docs
 )
 */
export const card = TemplateElement.fromCustom<Ui5Card, {
  slots: {
    default: HTMLElement,
    header: Ui5CardHeader,
  }
}
>(() => document.createElement('ui5-card') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-card--docs
 )
 */
export const cardHeader = TemplateElement.fromCustom<Ui5CardHeader, {
  slots: {
    action: HTMLElement,
    avatar: HTMLElement,
  },
  events: {
    click: CustomEvent,
  }
}
>(() => document.createElement('ui5-card-header') as any);
