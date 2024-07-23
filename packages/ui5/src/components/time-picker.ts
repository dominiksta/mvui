import { TemplateElement } from "@mvuijs/core";
import Ui5TimePicker from "@ui5/webcomponents/dist/TimePicker";
import "@ui5/webcomponents/dist/TimePicker.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-timepicker--docs
 )
 */
export const timePicker = TemplateElement.fromCustom<Ui5TimePicker, {
  events: {
    change: CustomEvent<{
      value: string,
      valid: boolean,
    }>,
    input: CustomEvent<{
      value: string,
      valid: boolean,
    }>
  },
  slots: {
    valueStateMessage: any,
  }
}
>(() => document.createElement('ui5-time-picker') as any);
