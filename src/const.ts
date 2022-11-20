
const defaultConfig = {
  APP_DEBUG: true
};

(window as any).MVUI_CONFIG = defaultConfig;
export const CONFIG: typeof defaultConfig = (window as any).MVUI_CONFIG;
