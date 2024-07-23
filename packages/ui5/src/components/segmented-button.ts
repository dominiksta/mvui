import { TemplateElement } from "@mvuijs/core";
import Ui5SegmentedButton from "@ui5/webcomponents/dist/SegmentedButton";
import Ui5SegmentedButtonItem from "@ui5/webcomponents/dist/SegmentedButtonItem";
import "@ui5/webcomponents/dist/SegmentedButton.js";
import "@ui5/webcomponents/dist/SegmentedButtonItem.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-segmentedbutton--docs
 )
 */
export const segmentedButton = TemplateElement.fromCustom<Ui5SegmentedButton, {
  slots: {
    default: Ui5SegmentedButtonItem,
  },
  events: {
    'selection-change': CustomEvent<{
      selectedItem: Ui5SegmentedButtonItem,
      selectedItems: Ui5SegmentedButtonItem[],
    }>,
  }
}
>(() => document.createElement('ui5-segmented-button') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-segmentedbutton--docs
 )
 */
export const segmentedButtonItem = TemplateElement.fromCustom<Ui5SegmentedButtonItem, {
  slots: {
    default: any,
  },
  events: {
    click: MouseEvent,
  }
}
>(() => document.createElement('ui5-segmented-button-item') as any);
