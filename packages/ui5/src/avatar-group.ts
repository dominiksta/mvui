import { TemplateElement } from "@mvui/core";
import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import Avatar from "@ui5/webcomponents/dist/Avatar";
import "@ui5/webcomponents/dist/AvatarGroup.js";
import AvatarColorScheme from "@ui5/webcomponents/dist/types/AvatarColorScheme";
import AvatarGroupType from "@ui5/webcomponents/dist/types/AvatarGroupType";

export declare class AvatarGroup extends UI5Element {
  get colorScheme(): AvatarColorScheme[];
  get hiddenItems(): Avatar[];
  type: AvatarGroupType;
}

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/components/AvatarGroup/
 )
 <iframe class="ui5"
 src="https://sap.github.io/ui5-webcomponents/playground/components/AvatarGroup/">
 </iframe>
 */
export const avatarGroup = TemplateElement.fromCustom<AvatarGroup,
  {
    click: { targetRef: Avatar, overflowButtonClicked: boolean },
    overflow: void
  }
>(() => document.createElement('ui5-avatar-group') as any);
