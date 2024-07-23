import { TemplateElement } from "@mvuijs/core";
import Ui5MultiComboBox from "@ui5/webcomponents/dist/MultiComboBox";
import Ui5MultiComboBoxItem from "@ui5/webcomponents/dist/MultiComboBoxItem";
import Ui5MultiComboBoxGroupItem from "@ui5/webcomponents/dist/MultiComboBoxGroupItem";
import "@ui5/webcomponents/dist/MultiComboBox.js";
import "@ui5/webcomponents/dist/MultiComboBoxItem.js";
import "@ui5/webcomponents/dist/MultiComboBoxGroupItem.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-multi-combo-box--docs
 )
 */
export const multiComboBox = TemplateElement.fromCustom<Ui5MultiComboBox, {
  slots: {
    default: Ui5MultiComboBoxItem | Ui5MultiComboBoxGroupItem,
    icon: any,
    valueStateMessage: any,
  },
  events: {
    close: CustomEvent,
    input: CustomEvent,
    'open-change': CustomEvent,
    'selection-change': CustomEvent<{items: Ui5MultiComboBoxItem[]}>,
  }
}>(() => document.createElement('ui5-multi-combobox') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-multi-combo-box--docs
 )
 */
export const multiComboBoxItem = TemplateElement.fromCustom<Ui5MultiComboBoxItem, {
}>(() => document.createElement('ui5-mcb-item') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-multi-combo-box--docs
 )
 */
export const multiComboBoxGroupItem = TemplateElement.fromCustom<Ui5MultiComboBoxGroupItem, {
}>(() => document.createElement('ui5-mcb-group-item') as any);
