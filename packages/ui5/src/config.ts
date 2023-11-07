import "@ui5/webcomponents/dist/Assets.js";
import { setTheme as _setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

type Themes =
  'sap_horizon' | 'sap_horizon_dark' | 'sap_horizon_hcb' | 'sap_horizon_hcw' |
  'sap_fiori_3' | 'sap_fiori_3_dark' | 'sap_fiori_3_hcb' | 'sap_fiori_3_hcw' |
  'sap_belize' | 'sap_belize_hcb' | 'sap_belize_hcw';

export function setTheme(theme: Themes) { _setTheme(theme); }

export function setGlobalCompact(compact: boolean) {
  if (compact) {
    document.body.setAttribute('data-ui5-compact-size', 'false');
  } else {
    document.body.removeAttribute('data-ui5-compact-size');
  }
}

export {
  setAnimationMode, getAnimationMode
} from "@ui5/webcomponents-base/dist/config/AnimationMode.js";
export { getLanguage, setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
export { getCalendarType } from "@ui5/webcomponents-base/dist/config/CalendarType.js";
export {
  getNoConflict, setNoConflict
} from "@ui5/webcomponents-base/dist/config/NoConflict.js";
export { getFirstDayOfWeek } from "@ui5/webcomponents-base/dist/config/FormatSettings.js";
export {
  getFetchDefaultLanguage, setFetchDefaultLanguage
} from "@ui5/webcomponents-base/dist/config/Language.js";
