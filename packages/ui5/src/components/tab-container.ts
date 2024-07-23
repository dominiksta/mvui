import { TemplateElement } from "@mvuijs/core";
import Ui5TabContainer from "@ui5/webcomponents/dist/TabContainer";
import Ui5Tab from "@ui5/webcomponents/dist/Tab";
import Ui5TabSeparator from "@ui5/webcomponents/dist/TabSeparator";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents/dist/TabSeparator.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-tab-container--docs
 )
 */
export const tabContainer = TemplateElement.fromCustom<Ui5TabContainer, {
  slots: {
    default: Ui5Tab | Ui5TabSeparator,
    overflowButton: any,
    startOverflowButton: any,
  },
  events: {
    'tab-select': CustomEvent<{
      tab: Ui5Tab,
      tabIndex: number,
    }>,
  }
}
>(() => document.createElement('ui5-tabcontainer') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-tab-container--docs
 )
 */
export const tab = TemplateElement.fromCustom<Ui5Tab, {
  slots: {
    default: any,
    subTabs: Ui5Tab | Ui5TabSeparator,
  },
}
>(() => document.createElement('ui5-tab') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-tab-container--docs
 )
 */
export const tabSeperator = TemplateElement.fromCustom<Ui5TabSeparator, {
}
>(() => document.createElement('ui5-tab-seperator') as any);
