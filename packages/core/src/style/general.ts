import { MVUI_GLOBALS } from "../globals";
import { camelToDash } from "../util/strings";
import { BROWSER_SUPPORTS_ADOPTED_STYLESHEETS } from "./helper";

const AT_RULE = '__MVUI_AT_RULE__';

/**
 * A CSS declaration.
 *
 * @example
 * ```typescript
 * {
 *   'background': 'black',
 *   'color': 'white',
 * }
 * ```
 */
export type MvuiCSSDeclarations =
  Partial<CSSStyleDeclaration> & { [key: string]: string };

/**
 * A CSS ruleset. (You will likely never want to create this manually and use the {@link
 * sheet} helper to create these instead.)
 *
 * @example
 * ```typescript
 * { selector: 'button', { 'background': 'black', 'color': 'white' }}
 * // equivalent to
 * style.sheet({
 *   'button': {
 *     'background': 'black',
 *     'color': 'white',
 *   }
 * })[0]
 * ```
 */
export type MvuiCSSRuleset = { selector: string, declarations: MvuiCSSDeclarations };

/** Implementation detail for {@link MvuiCSSAtRule} */
export type MvuiCSSAtRuleBodyTMap = {
  'sheet': MvuiCSSSheet,
  'declarations': MvuiCSSDeclarations,
  'none': undefined,
}

/**
 * Represents a CSS \@rule. You should not create objects of this type yourself. Instead
 * use the helper functions provided in the {@link at} object.
 *
 * @example
 * ```typescript
 * static styles = [
 *   ...style.sheet({
 *     'button': { background: 'green' },
 *   }),
 *   style.at.media('screen and (min-width: 900px)', style.sheet({
 *     'button': {
 *       borderRadius: '10px',
 *     }
 *   })),
 * ]
 * ```
 */
export type MvuiCSSAtRule<BodyT extends 'sheet' | 'declarations' | 'none'> = {
  marker: '__MVUI_AT_RULE__',
  identifier: string,
  parameters: string,
  body: {
    type: BodyT,
    content: MvuiCSSAtRuleBodyTMap[BodyT]
  },
}

/**
 * Represents a complete CSS stylesheet, which may or may not include \@rules with
 * sub-sheets. This is the type of the static ({@link Component.styles}) and instance
 * ({@link Component#styles}) fields of {@link Component}.
 */
export type MvuiCSSSheet = (MvuiCSSRuleset | MvuiCSSAtRule<any>)[];

const _util = {
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

/**
 * Create a list of CSS rulesets for use with the {@link Component.styles} field.
 * @example
 * ```typescript
 * style.sheet({
 *   'button': {
 *     'background': 'black',
 *     'color': 'white',
 *   }
 * })
 * ```
 */
export function sheet(
  sheet: { [selector: string]: MvuiCSSDeclarations }
): MvuiCSSSheet {
  return Object.keys(sheet).map(key => ({ selector: key, declarations: sheet[key] }));
}

/**
 * Create a CSS \@rule (such as a media query).
 *
 * @example
 * ```typescript
 * static styles = [
 *   ...style.sheet({
 *     'button': { background: 'green' },
 *   }),
 *   style.at.media('screen and (min-width: 900px)', style.sheet({
 *     'button': {
 *       borderRadius: '10px',
 *     }
 *   })),
 * ]
 * ```
 */
export const at = {
  charset: _util.genAtRuleNone('charset'),
  container: _util.genAtRuleSheet('container'),
  counterStyle: _util.genAtRuleDecls('counter-style'),
  fontFace: _util.genAtRuleDecls('font-face'),
  fontPaletteValues: _util.genAtRuleDecls('font-palette-values'),
  import: _util.genAtRuleNone('import'),
  keyFrames: _util.genAtRuleSheet('keyframes'),
  layer: _util.genAtRuleSheet('layer'),
  media: _util.genAtRuleSheet('media'),
  namespace: _util.genAtRuleNone('namespace'),
  page: _util.genAtRuleDecls('page'),
  supports: _util.genAtRuleSheet('supports'),
}


/**
 * Convert a javascript representation of css into a full stylesheet as a string.
 *
 * @example
 * ```javascript
 * style.sheet({
 *   'body': {
 *     color: 'red',
 *     borderRadius: '4px',
 *     '-hi': '4',
 *   },
 *   'body > div': {
 *     flexBasis: 'hi',
 *   }
 * })
 * ```
 *
 * =>
 *
 * ```css
 * body {
 *   color: red
 *   border-radius: 4px
 *   -hi: 4
 * }
 * body > div {
 *   flex-basis: hi
 * }
 * ```
 */
function sheetToString(sheet: MvuiCSSSheet, indent = ''): string {
  let out = '';

  for (let rule of sheet) {
    if ('marker' in rule && rule.marker === AT_RULE) {

      out += `${indent}@${rule.identifier} ${rule.parameters}`;

      if (rule.body.type === 'sheet') {
        out += '{\n' + sheetToString(rule.body.content, indent + '  ');
      } else if (rule.body.type === 'declarations') {
        out += '{\n' + _util.declarationsToString(
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
        _util.declarationsToString(
          (rule as MvuiCSSRuleset).declarations, indent + '  '
        ) + '}\n';
    }
  }

  return out;
}


/** Apply `styles` to `el` */
function applySingleElement(
  el: HTMLElement, styles: Partial<CSSStyleDeclaration>
) {
  for (let key in styles) el.style[key] = styles[key] as any;
}

/**
   Put the given `sheet` into a `<style>` tag with the given `cssClass`
   as a child of `el`.
 */
function applySheetAsStyleTag(
  el: HTMLElement, sheet: MvuiCSSSheet, cssClass: string, noOverwrite = false,
) {
  cssClass = 'mvui-sheet-' + cssClass;
  let styleEl = (el.shadowRoot || el).querySelector<HTMLStyleElement>(
    '.' + cssClass
  );
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.className = cssClass;
    styleEl.nonce = MVUI_GLOBALS.STYLE_SHEET_NONCE;
    (el.shadowRoot || el).appendChild(styleEl);
  }
  if (styleEl.innerHTML !== '' && noOverwrite) return;
  styleEl.innerHTML = sheetToString(sheet);
}

/**
   Apply a named stylesheet to a given ShadowRoot using the `adoptedStyleSheets`
   feature. Will error if not supported. (As of 2023-11-12 only Safari seems to not have
   support.)
 */
function applySheetAsAdopted(
  sheet: MvuiCSSSheet, sr: ShadowRoot, name: string, noOverwrite = false,
) {
  if (!BROWSER_SUPPORTS_ADOPTED_STYLESHEETS)
    throw new Error('Browser does not support adoptedStyleSheets');

    const found = sr.adoptedStyleSheets.find(
      sheet => (sheet as any)[`__mvui_sheet_${name}`]
    );
    if (!found) {
      const domSheet = new CSSStyleSheet();
      domSheet.replaceSync(sheetToString(sheet));
      (domSheet as any)[`__mvui_sheet_${name}`] = true;
      sr.adoptedStyleSheets.push(domSheet);
    } else {
      if (found.cssRules.length !== 0 && noOverwrite) return;
      found.replaceSync(sheetToString(sheet));
    }
}

/**
 * Apply a given stylesheet to a given element. If the element has a shadowRoot and
 * adoptedStyleSheets are supported (everywhere but Safari as of 2023-01-11), the css will
 * be added to adoptedStyleSheets. If not, it will be added as a \<style\> tag with the
 * nonce set to window.MVUI_CONFIG.STYLE_SHEET_NONCE.
 */
function applySheet(
  sheet: MvuiCSSSheet, el: HTMLElement, name: string, noOverwrite = false,
) {
  if (BROWSER_SUPPORTS_ADOPTED_STYLESHEETS && el.shadowRoot) {
    applySheetAsAdopted(
      sheet, el.shadowRoot, name.replaceAll('-', '_'), noOverwrite
    );
  } else {
    applySheetAsStyleTag(el, sheet, name.replaceAll('_', '-'), noOverwrite);
  }
}

export const util = {
  sheetToString, applySingleElement,
  applySheet, applySheetAsStyleTag, applySheetAsAdopted,
};
