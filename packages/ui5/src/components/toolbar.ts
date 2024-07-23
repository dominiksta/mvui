import { TemplateElement } from "@mvuijs/core";
import Ui5Toolbar from "@ui5/webcomponents/dist/Toolbar";
import Ui5ToolbarButton from "@ui5/webcomponents/dist/ToolbarButton";
import Ui5ToolbarSelect from "@ui5/webcomponents/dist/ToolbarSelect";
import Ui5ToolbarSelectOption from "@ui5/webcomponents/dist/ToolbarSelectOption";
import Ui5ToolbarSeparator from "@ui5/webcomponents/dist/ToolbarSeparator";
import Ui5ToolbarSpacer from "@ui5/webcomponents/dist/ToolbarSpacer";
import "@ui5/webcomponents/dist/Toolbar.js";
import "@ui5/webcomponents/dist/ToolbarButton.js";
import "@ui5/webcomponents/dist/ToolbarSelect.js";
import "@ui5/webcomponents/dist/ToolbarSelectOption.js";
import "@ui5/webcomponents/dist/ToolbarSeparator.js";
import "@ui5/webcomponents/dist/ToolbarSpacer.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbar = TemplateElement.fromCustom<Ui5Toolbar, {
}
>(() => document.createElement('ui5-toolbar') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbarButton = TemplateElement.fromCustom<Ui5ToolbarButton, {
  events: {
    click: MouseEvent,
  }
}
>(() => document.createElement('ui5-toolbar-button') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbarSelect = TemplateElement.fromCustom<Ui5ToolbarSelect, {
  events: {
    change: MouseEvent,
    close: MouseEvent,
    open: MouseEvent,
  },
  slots: {
    default: Ui5ToolbarSelectOption
  }
}
>(() => document.createElement('ui5-toolbar-select') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbarSelectOption = TemplateElement.fromCustom<Ui5ToolbarSelectOption, {
}
>(() => document.createElement('ui5-toolbar-select-option') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbarSeparator = TemplateElement.fromCustom<Ui5ToolbarSeparator, {
}
>(() => document.createElement('ui5-toolbar-separator') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-toolbar--docs
 )
 */
export const toolbarSpacer = TemplateElement.fromCustom<Ui5ToolbarSpacer, {
}
>(() => document.createElement('ui5-toolbar-spacer') as any);
