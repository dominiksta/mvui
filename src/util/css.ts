import { CONFIG } from "../const";
import { uniq } from "./datastructure";
import { camelToDash } from "./strings";

// While there is a type for a CSSStyleSheet that might be usable here, it is not
// supported in Safari yet (2023-01-11).
export type MvuiCSSSheet = {
  [selector: string]: (Partial<CSSStyleDeclaration> & { [key: string]: string })
};

// not supported in safari (2023-01-11)
const BROWSER_SUPPORTS_ADOPTED_STYLESHEETS =
  'adoptedStyleSheets' in Document.prototype;

const CSSUtils = {

  /** Apply `styles` to `el` */
  applySingleElement: function(
    el: HTMLElement, styles: Partial<CSSStyleDeclaration>
  ) {
    for (let key in styles) el.style[key] = styles[key] as any;
  },

  /**
   * Convert a javascript representation of css into a full stylesheet as a string.
   *
   * Example:
   *
   * 'body': {
   *   color: 'red',
   *   borderRadius: '4px',
   *   '-hi': '4',
   * },
   * 'body > div': {
   *   flexBasis: 'hi',
   * }
   *
   * =>
   *
   * body {
   *   color: red
   *   border-radius: 4px
   *   -hi: 4
   * }
   * body > div {
   *   flex-basis: hi
   * }
   */
  sheetToString: function(
    css: MvuiCSSSheet,
  ) {
    let out = '';
    for (let selector in css) {
      out += selector + ' { \n';

      for (let property in css[selector]) {
        out += '  ' + camelToDash(property) + ': ' +
          css[selector][property] + ';\n';
      }

      out += '}\n'
    }
    return out;
  },

  mergeSheets: function(s1: MvuiCSSSheet, s2: MvuiCSSSheet): MvuiCSSSheet {

    // one could propbably implement this in a more terse way but using good old for loops
    // typically improves performance a bit, and since this function may be called a lot in
    // certain use cases this way is probably preferable

    let out: MvuiCSSSheet = {};

    const selectors = uniq([...Object.keys(s1), ...Object.keys(s2)]);

    for (let selector of selectors) {
      console.log(selector)
      if (selector in s1 && selector in s2) {
        out[selector] = {};

        const props = uniq([
          ...Object.keys(s1[selector]), ...Object.keys(s2[selector])
        ]);

        for (let prop of props) {
          if (prop in s1[selector] && prop in s2[selector]) {
            // prefer value in second stylesheet
            out[selector][prop] = s2[selector][prop];
          } else if (prop in s1[selector]) {
            out[selector][prop] = s1[selector][prop];
          } else if (prop in s2[selector]) {
            out[selector][prop] = s2[selector][prop];
          }
        }

      } else if (selector in s1) {
        out[selector] = s1[selector];
      } else if (selector in s2) {
        out[selector] = s2[selector];
      }
    }
    console.log(out);
    return out;
  },

  /**
   * Apply a given stylesheet to a given element. If the element has a shadowRoot and
   * adoptedStyleSheets are supported (everywhere but Safari as of 2023-01-11), the css will
   * be added to adoptedStyleSheets. If not, it will be added as a <style> tag with the
   * nonce set to window.MVUI_CONFIG.STYLE_SHEET_NONCE.
   */
  applySheet: function(css: string, el: HTMLElement) {
    if (BROWSER_SUPPORTS_ADOPTED_STYLESHEETS && el.shadowRoot) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      el.shadowRoot.adoptedStyleSheets.push(sheet);
    } else {
      const sheet = document.createElement('style');
      sheet.innerHTML = css;
      sheet.nonce = CONFIG.STYLE_SHEET_NONCE;
      el.appendChild(sheet);
    }
  }
}

export default CSSUtils;
