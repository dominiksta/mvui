import { TemplateElement } from "@mvuijs/core";
import Ui5RangeSlider from "@ui5/webcomponents/dist/RangeSlider";
import "@ui5/webcomponents/dist/RangeSlider.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-progress-indicator--docs
 )
 */
export const rangeSlider = TemplateElement.fromCustom<Ui5RangeSlider, {
  events: {
    change: CustomEvent
    input: CustomEvent
  }
}
>(() => document.createElement('ui5-range-slider') as any);
