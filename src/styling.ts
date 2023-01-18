import { CONFIG } from "./const";
import { camelToDash } from "./util/strings";

const AT_RULE = Symbol();

type MvuiCSSDeclarations = Partial<CSSStyleDeclaration> & { [key: string]: string };
type MvuiCSSRuleset =  {selector: string, declarations: MvuiCSSDeclarations};

type MvuiCSSAtRuleBodyTMap = {
  'sheet': MvuiCSSSheet,
  'declarations': MvuiCSSDeclarations,
  'none': undefined,
}

type MvuiCSSAtRule<BodyT extends 'sheet' | 'declarations' | 'none'> = {
  marker: typeof AT_RULE,
  identifier: string,
  parameters: string,
  body: {
    type: BodyT,
    content: MvuiCSSAtRuleBodyTMap[BodyT]
  },
}

export type MvuiCSSSheet = (MvuiCSSRuleset | MvuiCSSAtRule<any>)[];

const Util = {
  declarationsToString: function(
    decls: MvuiCSSDeclarations, indent = '  ',
  ): string {
    let out = '';
    for (let property in decls)
      out += indent + camelToDash(property) + ': ' + decls[property] + ';\n';
    return out;
  },

  genAtRuleSheet: function(identifier: string): (
    parameters: string, body: MvuiCSSSheet
  ) => MvuiCSSAtRule<'sheet'> {
    return (parameters: string, body: MvuiCSSSheet) => ({
      parameters, identifier, body: { type: 'sheet', content: body },
      marker: AT_RULE,
    })
  },

  genAtRuleDecls: function(identifier: string): (
    parameters: string, body: MvuiCSSDeclarations
  ) => MvuiCSSAtRule<'declarations'> {
    return (parameters: string, body: MvuiCSSDeclarations) => ({
      parameters, identifier, body: { type: 'declarations', content: body },
      marker: AT_RULE,
    })
  },

  genAtRuleNone: function(identifier: string): (
    parameters: string
  ) => MvuiCSSAtRule<'none'> {
    return (parameters: string) => ({
      parameters, identifier, body: { type: 'none', content: undefined },
      marker: AT_RULE,
    })
  }

}

// not supported in safari (2023-01-11)
const BROWSER_SUPPORTS_ADOPTED_STYLESHEETS =
  'adoptedStyleSheets' in Document.prototype;

export default class Styling {
  static Ruleset(selector: string, declarations: MvuiCSSDeclarations) {
    return { selector, declarations };
  }

  static SimpleSheet(
    sheet: {[selector: string]: MvuiCSSDeclarations}
  ): MvuiCSSRuleset[] {
    return Object.keys(sheet).map(key => ({selector: key, declarations: sheet[key]}));
  }

  static At = {
    Charset           : Util.genAtRuleNone('charset'),
    Container         : Util.genAtRuleSheet('container'),
    CounterStyle      : Util.genAtRuleDecls('counter-style'),
    FontFace          : Util.genAtRuleDecls('font-face'),
    FontPaletteValues : Util.genAtRuleDecls('font-palette-values'),
    Import            : Util.genAtRuleNone('import'),
    KeyFrames         : Util.genAtRuleSheet('keyframes'),
    Layer             : Util.genAtRuleSheet('layer'),
    Media             : Util.genAtRuleSheet('media'),
    Namespace         : Util.genAtRuleNone('namespace'),
    Page              : Util.genAtRuleDecls('page'),
    Supports          : Util.genAtRuleSheet('supports'),
  }


  /**
   * Convert a javascript representation of css into a full stylesheet as a string.
   *
   * Example:
   *
   * Styling.SimpleSheet({
   *   'body': {
   *     color: 'red',
   *     borderRadius: '4px',
   *     '-hi': '4',
   *   },
   *   'body > div': {
   *     flexBasis: 'hi',
   *   }
   * })
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
  static sheetToString(sheet: MvuiCSSSheet, indent = ''): string {
    let out = '';

    for (let rule of sheet) {
      if ('marker' in rule && rule.marker === AT_RULE) {

        out += `${indent}@${rule.identifier} ${rule.parameters}`;

        if (rule.body.type === 'sheet') {
          out += '{\n' + Styling.sheetToString(rule.body.content, indent + '  ');
        } else if (rule.body.type === 'declarations') {
          out += '{\n' + Util.declarationsToString(
            rule.body.content, indent + '  '
          );
        }

        if (rule.body.type === 'none') {
          out += ';'
        } else {
          out += indent + '}\n';
        }
        
      } else {
        // normal rule
        out += indent + (rule as MvuiCSSRuleset).selector + ' { \n' +
          Util.declarationsToString(
            (rule as MvuiCSSRuleset).declarations, indent + '  '
          ) + '}\n';
      }
    }

    return out;
  }


  /** Apply `styles` to `el` */
  static applySingleElement(
    el: HTMLElement, styles: Partial<CSSStyleDeclaration>
  ) {
    for (let key in styles) el.style[key] = styles[key] as any;
  }


  /**
   * Apply a given stylesheet to a given element. If the element has a shadowRoot and
   * adoptedStyleSheets are supported (everywhere but Safari as of 2023-01-11), the css will
   * be added to adoptedStyleSheets. If not, it will be added as a <style> tag with the
   * nonce set to window.MVUI_CONFIG.STYLE_SHEET_NONCE.
   */
  static applySheet(css: string, el: HTMLElement) {
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
