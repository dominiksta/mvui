// typedef
// ----------------------------------------------------------------------

export type MvuiConfig = {
  /**
     Wether the app should run in debug mode. Currently the only effect of setting this to
     true is that components will flash whenever they update some {@link
     rx.types.Subscribable} in their template.
   */
  APP_DEBUG: boolean,
  /**
     When mvui runs in a browser that does not support adoptedStyleSheets (basically just
     Safari), it will apply its styles as a `<style/>` tag instead. When doing so, you can
     configure the nonce attribute of that style object with this property. See
     https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce for
     details.
   */
  STYLE_SHEET_NONCE: string,
  /**
     See {@link configurePrefixes}
   */
  PREFIXES: Map<string, string>,
}

// defaults
// ----------------------------------------------------------------------

const globals: MvuiConfig = {
  APP_DEBUG: false,
  STYLE_SHEET_NONCE: 'mvui-component',
  PREFIXES: new Map<string, string>(),
};

globals.PREFIXES.set('default', 'app');

// set up
// ----------------------------------------------------------------------

function maybeSetGlobal() {
  const w = (window as any);
  if (!('__MVUI_GLOBALS' in w)) w.__MVUI_GLOBALS = globals;
}

maybeSetGlobal();

// export
// ----------------------------------------------------------------------

/**
   A global configuration object. You can change its properties by importing or
   alternatively using the `__MVUI_GLOBALS` window scoped object.

   See {@link MvuiConfig} for available options.
 */
export const MVUI_GLOBALS: MvuiConfig = (window as any).__MVUI_GLOBALS;
