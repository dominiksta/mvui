import { TemplateElement } from "@mvuijs/core";
import Ui5Carousel from "@ui5/webcomponents/dist/Carousel";
import "@ui5/webcomponents/dist/Carousel.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-carousel--docs
 )
 */
export const carousel = TemplateElement.fromCustom<Ui5Carousel, {
  events: {
    navigate: CustomEvent<{
      selectedIndex: number,
    }>
  },
  slots: {
    default: HTMLElement,
  }
}
>(() => document.createElement('ui5-carousel') as any);


