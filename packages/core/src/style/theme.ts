import { State, Stream } from '../rx';
import { camelToDash } from '../util/strings';
import { MvuiCSSRuleset, util } from './sheet';

type ThemeDef = { [key: string]: string };

/**
   Set up some theme variables to be consumed throughout the application.

   @example
   ```typescript

   // theme.ts
   // ----------------------------------------------------------------------

   type MyAppTheme = {
     background: string,
     color: string,
   }

   export const lightTheme: MyAppTheme = {
     background: '#F5F6F7',
     color: 'black',
   }

   export const darkTheme: MyAppTheme = {
     background: '#12171C',
     color: 'white',
   }

   export const theme = style.themeVariables('my-app', lightTheme);

   // main.ts (or anywhere else)
   // ----------------------------------------------------------------------
   import { Component, style } from '@mvuijs/core';
   import { theme, darkTheme } from './theme';

   style.setTheme('my-app', darkTheme);

   @Component.register
   class MyComponent extends Component {
     static styles = style.sheet({
       'background': theme.background,
     })
     // ...
   }
   ```
 */
export function themeVariables<T extends ThemeDef>(
  libName: string, variables: T
): T {
  const ret: T = {} as any;
  for (const k in variables) {
    (ret as any)[k] = `var(--${libName}-${camelToDash(k)})`;
  }
  return ret;
}

const themes: { [libName: string]: ThemeDef } = { };

/**
   Set the current theme. See {@link themeVariables} for more details and an example.
 */
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
  themes[libName] = def;
}

/** Get the current theme (after calling {@link setTheme}). */
export const getTheme = (libName: string): ThemeDef | false =>
  (libName in themes) ? themes[libName] : false;


// TODO: share with refcount
const _currentTheme$ = new Stream<'dark' | 'light'>(observer => {
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

/** Subscribe to this to get the current browser theme. */
export const currentTheme$ = new State<'dark' | 'light'>(
  window.matchMedia
    ? (
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? "dark"
        : "light"
    )
    : "dark"
);
_currentTheme$.subscribe(currentTheme$);
