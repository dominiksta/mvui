import { TemplateElement } from "@mvuijs/core";
import Avatar from "@ui5/webcomponents/dist/Avatar";
import AvatarGroup from "@ui5/webcomponents/dist/AvatarGroup";
import "@ui5/webcomponents/dist/AvatarGroup.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-avatargroup--docs
 )
 */
export const avatarGroup = TemplateElement.fromCustom<AvatarGroup, {
  events: {
    click: { targetRef: Avatar, overflowButtonClicked: boolean },
    overflow: void
  }
}>(() => document.createElement('ui5-avatar-group') as any);
