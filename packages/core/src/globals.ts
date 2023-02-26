const globals = {
  APP_DEBUG: true,
  STYLE_SHEET_NONCE: 'mvui-component',
  PREFIXES: new Map<string, string>(),
};

globals.PREFIXES.set('default', 'app');

(window as any).__MVUI_GLOBALS = globals;
export const MVUI_GLOBALS: typeof globals = (window as any).__MVUI_GLOBALS;
