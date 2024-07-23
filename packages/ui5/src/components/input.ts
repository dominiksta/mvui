import { TemplateElement } from "@mvuijs/core";
import { default as Ui5Input } from "@ui5/webcomponents/dist/Input";
import { default as Ui5SuggestionItem } from "@ui5/webcomponents/dist/SuggestionItem";
import { default as Ui5SuggestionGroupItem } from "@ui5/webcomponents/dist/SuggestionGroupItem";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/SuggestionItem.js";
import "@ui5/webcomponents/dist/SuggestionGroupItem.js";
import "@ui5/webcomponents/dist/features/InputSuggestions.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-input--docs
 )
 */
export const input = TemplateElement.fromCustom<Ui5Input, {
  slots: {
    default: Ui5SuggestionGroupItem,
    icon: any,
    valueStateMessage: any,
  },
  events: {
    change: CustomEvent,
    input: CustomEvent,
    'suggestion-item-previer': {
      item: Ui5SuggestionItem,
      targetRef: HTMLElement
    },
    'suggestion-item-select': {
      item: Ui5SuggestionItem
    }
  }
}>(() => document.createElement('ui5-input') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-input--docs
 )
 */
export const suggestionItem = TemplateElement.fromCustom<Ui5SuggestionItem, {
}>(() => document.createElement('ui5-suggestion-item') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-input--docs
 )
 */
export const suggestionGroupItem = TemplateElement.fromCustom<Ui5SuggestionGroupItem, {
}>(() => document.createElement('ui5-suggestion-group-item') as any);
