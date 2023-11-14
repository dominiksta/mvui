// fonts
// ----------------------------------------------------------------------

import { createStyle } from "@ui5/webcomponents-base/dist/ManagedStyles";
import '@mvui/sap-ui5-fonts';

createStyle('', 'data-ui5-font-face');

// exports
// ----------------------------------------------------------------------

export * as config from './config';
export * from './components';
export { Theme } from '@mvui/ui5/src/theme';
