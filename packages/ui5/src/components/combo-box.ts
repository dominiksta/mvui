import { TemplateElement } from "@mvuijs/core";
import Ui5ComboBox from "@ui5/webcomponents/dist/ComboBox";
import Ui5ComboBoxItem from "@ui5/webcomponents/dist/ComboBoxItem";
import Ui5ComboBoxGroupItem from "@ui5/webcomponents/dist/ComboBoxGroupItem";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/ComboBoxItem.js";
import "@ui5/webcomponents/dist/ComboBoxGroupItem.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-combo-box--docs
 )
 */
export const comboBox = TemplateElement.fromCustom<Ui5ComboBox, {
  events: {
    change: CustomEvent,
    input: CustomEvent,
    'selection-change': CustomEvent<{ item: Ui5ComboBoxItem }>,
  },
  slots: {
    default: Ui5ComboBoxItem,
    icon: any,
    valueStateMessage: any,
  }
}
>(() => document.createElement('ui5-combobox') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-combo-box--docs
 )
 */
export const comboBoxItem = TemplateElement.fromCustom<Ui5ComboBoxItem, {
}
>(() => document.createElement('ui5-cb-item') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-combo-box--docs
 )
 */
export const comboBoxGroupItem = TemplateElement.fromCustom<Ui5ComboBoxGroupItem, {
}
>(() => document.createElement('ui5-cb-group-item') as any);
