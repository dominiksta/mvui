import { TemplateElement } from "@mvuijs/core";
import Ui5Slider from "@ui5/webcomponents/dist/Slider";
import "@ui5/webcomponents/dist/Slider.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-slider--docs
 )
 */
export const slider = TemplateElement.fromCustom<Ui5Slider, {
  events: {
    change: CustomEvent,
    input: CustomEvent,
  }
}
>(() => document.createElement('ui5-slider') as any);
