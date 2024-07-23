import { TemplateElement } from "@mvuijs/core";
import Ui5Calendar from "@ui5/webcomponents/dist/Calendar";
import Ui5CalendarDate from "@ui5/webcomponents/dist/CalendarDate";
import "@ui5/webcomponents/dist/Calendar.js";
import "@ui5/webcomponents/dist/CalendarDate.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-calendar--docs
 )
 */
export const calendar = TemplateElement.fromCustom<Ui5Calendar, {
  events: {
    'selected-dates-change': CustomEvent<{
      values: string[],
      dates: number[],
    }>
  },
  slots: {
    default: Ui5CalendarDate,
  }
}
>(() => document.createElement('ui5-calendar') as any);


export const calendarDate = TemplateElement.fromCustom<Ui5CalendarDate>(
  () => document.createElement('ui5-date') as any
);
