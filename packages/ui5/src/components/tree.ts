import { TemplateElement } from "@mvui/core";
import Ui5Button from "@ui5/webcomponents/dist/Button";
import Ui5Tree from "@ui5/webcomponents/dist/Tree";
import Ui5TreeItem from "@ui5/webcomponents/dist/TreeItem";
import "@ui5/webcomponents/dist/Tree.js";
import "@ui5/webcomponents/dist/TreeItem.js";
import "@ui5/webcomponents/dist/Button.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-tree--docs
 )
 */
export const tree = TemplateElement.fromCustom<Ui5Tree, {
  slots: {
    default: Ui5TreeItem,
    header: any,
  },
  events: {
    'item-click': CustomEvent<{ item: Ui5TreeItem }>,
    'item-delete': CustomEvent<{ item: Ui5TreeItem }>,
    'item-mouseout': CustomEvent<{ item: Ui5TreeItem }>,
    'item-toggle': CustomEvent<{ item: Ui5TreeItem }>,
    'selection-change': CustomEvent<{
      selectedItems: Ui5TreeItem[],
      previouslySelectedItems: Ui5TreeItem[],
      targetItem: Ui5TreeItem,
    }>,
  }
}
>(() => document.createElement('ui5-tree') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-tree--docs
 )
 */
export const treeItem = TemplateElement.fromCustom<Ui5TreeItem, {
  slots: {
    default: any,
    deleteButton: Ui5Button,
  },
  events: {
    'detail-click': CustomEvent,
  }
}
>(() => document.createElement('ui5-tree-item') as any);
