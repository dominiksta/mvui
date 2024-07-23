import { TemplateElement } from "@mvuijs/core";
import Ui5StepInput from "@ui5/webcomponents/dist/StepInput";
import "@ui5/webcomponents/dist/StepInput.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-stepinput--docs
 )
 */
export const stepInput = TemplateElement.fromCustom<Ui5StepInput, {
  slots: {
    valueStateMessage: any,
  },
  events: {
    change: CustomEvent,
  }
}
>(() => document.createElement('ui5-step-input') as any);
