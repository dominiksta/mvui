
const defaultConfig = {
  APP_DEBUG: true,
  STYLE_SHEET_NONCE: 'mvui-component',
};

(window as any).MVUI_CONFIG = defaultConfig;
export const CONFIG: typeof defaultConfig = (window as any).MVUI_CONFIG;
