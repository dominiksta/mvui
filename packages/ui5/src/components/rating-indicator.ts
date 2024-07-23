import { TemplateElement } from "@mvuijs/core";
import Ui5RatingIndicator from "@ui5/webcomponents/dist/RatingIndicator";
import "@ui5/webcomponents/dist/RatingIndicator.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-rating-indicator--docs
 )
 */
export const ratingIndicator = TemplateElement.fromCustom<Ui5RatingIndicator, {
  events: {
    change: CustomEvent,
  }
}
>(() => document.createElement('ui5-rating-indicator') as any);
