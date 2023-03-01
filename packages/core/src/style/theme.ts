import { Stream } from '../rx';
import { camelToDash } from '../util/strings';
import { MvuiCSSRuleset, MvuiCSSSheet, sheet, util } from './general';

type ThemeDef = { [key: string]: string };

export function themeVariables<T extends ThemeDef>(
  libName: string, variables: T
): T {
  const ret: T = {} as any;
  for (const k in variables) {
    (ret as any)[k] = `var(--${libName}-${camelToDash(k)})`;
  }
  return ret;
}

export function setTheme(
  libName: string, def: ThemeDef
) {
  const wrapperSheet: MvuiCSSRuleset[] = [{
    selector: ':root',
    declarations: {}
  }];

  for (const k in def) {
    wrapperSheet[0].declarations[`--${libName}-${camelToDash(k)}`] = def[k];
  }

  util.applySheetAsStyleTag(document.head, wrapperSheet, `${libName}-theme`);
}

// TODO: share with refcount
export const currentTheme$ = new Stream<'dark' | 'light'>(observer => {
  if (!window.matchMedia) {
    observer.next('light');
    return;
  }

  observer.next(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? "dark" : "light"
  );

  const eventHandler = (e: MediaQueryListEvent) => {
    observer.next(e.matches ? 'dark' : 'light')
  };

  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', eventHandler);

  return () =>
    window.matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', eventHandler);
});
