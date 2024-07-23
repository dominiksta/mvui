import { TemplateElement } from "@mvuijs/core";
import Ui5Button from "@ui5/webcomponents/dist/Button";
import Ui5List from "@ui5/webcomponents/dist/List";
import Ui5ListItem from "@ui5/webcomponents/dist/ListItem";
import Ui5CustomListItem from "@ui5/webcomponents/dist/CustomListItem";
import Ui5GroupHeaderListItem from "@ui5/webcomponents/dist/GroupHeaderListItem";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItem.js";

type AnyListItem = Ui5ListItem | Ui5CustomListItem | Ui5GroupHeaderListItem;

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-list--docs
 )
 */
export const list = TemplateElement.fromCustom<Ui5List, {
  slots: {
    default: AnyListItem,
    header: any,
  },
  events: {
    'item-click': CustomEvent<{ item: AnyListItem }>,
    'item-close': CustomEvent<{ item: AnyListItem }>,
    'item-delete': CustomEvent<{ item: AnyListItem }>,
    'item-toggle': CustomEvent<{ item: AnyListItem }>,
    'load-more': CustomEvent,
    'selection-change': CustomEvent<{
      selectedItems: AnyListItem[],
      previouslySelectedItems: AnyListItem[],
    }>,
  }
}
>(() => document.createElement('ui5-list') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-list--docs
 )
 */
export const li = TemplateElement.fromCustom<Ui5ListItem, {
  slots: {
    default: any,
    imageContent: any,
    deleteButton: any | Ui5Button,
  },
  events: {
    'detail-click': CustomEvent,
  }
}
>(() => document.createElement('ui5-li') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-list--docs
 )
 */
export const liCustom = TemplateElement.fromCustom<Ui5CustomListItem, {
  slots: {
    default: any,
    deleteButton: any | Ui5Button,
  },
  events: {
    'detail-click': CustomEvent,
  }
}
>(() => document.createElement('ui5-li-custom') as any);

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-list--docs
 )
 */
export const liGroupHeader = TemplateElement.fromCustom<Ui5GroupHeaderListItem, {
  slots: {
    default: any,
  }
}
>(() => document.createElement('ui5-li-groupheader') as any);
