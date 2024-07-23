import { TemplateElement } from "@mvuijs/core";
import Ui5DatePicker from "@ui5/webcomponents/dist/DatePicker";
import "@ui5/webcomponents/dist/DatePicker.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-datepicker--docs
 )
 */
export const datePicker = TemplateElement.fromCustom<Ui5DatePicker, {
  events: {
    change: CustomEvent<{value: string, valid: boolean}>,
    input: CustomEvent<{value: string, valid: boolean}>,
  },
  slots: {
    valueStateMessage: any,
  }
}
>(() => document.createElement('ui5-date-picker') as any);

import Ui5DateRangePicker from "@ui5/webcomponents/dist/DateRangePicker";
import "@ui5/webcomponents/dist/DateRangePicker.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-daterangepicker--docs
 )
 */
export const dateRangePicker = TemplateElement.fromCustom<Ui5DateRangePicker, {
  events: {
    change: CustomEvent<{value: string, valid: boolean}>,
    input: CustomEvent<{value: string, valid: boolean}>,
  },
  slots: {
    valueStateMessage: any,
  }
}
>(() => document.createElement('ui5-daterange-picker') as any);


import Ui5DateTimePicker from "@ui5/webcomponents/dist/DateTimePicker";
import "@ui5/webcomponents/dist/DateTimePicker.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-datetimepicker--docs
 )
 */
export const dateTimePicker = TemplateElement.fromCustom<Ui5DateTimePicker, {
  events: {
    change: CustomEvent<{value: string, valid: boolean}>,
    input: CustomEvent<{value: string, valid: boolean}>,
  },
  slots: {
    valueStateMessage: any,
  }
}
>(() => document.createElement('ui5-datetime-picker') as any);
