import { style } from "@mvui/core";

const stdLibThemeKeys = [
  'bg',
  'bgContrastMiddle',
  'fg',
  'fgContrastMiddle',
  'primary', 'accent',
  'font'
] as const;
export type StdLibTheme = { [key in typeof stdLibThemeKeys[number]]: string };

export const baseTheme = {
  font: 'Ubuntu, sans-serif',
}

export const lightTheme: StdLibTheme = {
  ...baseTheme,
  bg: 'white',
  bgContrastMiddle: '#f0f0f0',
  fgContrastMiddle: '#555555',
  fg: 'black',
  primary: 'blue',
  accent: '#ff4081',
}

export const darkTheme: StdLibTheme = {
  ...baseTheme,
  bg: '#222222',
  bgContrastMiddle: '#555555',
  fgContrastMiddle: '#aaaaaa',
  fg: 'white',
  primary: 'blue',
  accent: '#ff4081',
}

export const MVUI_STDLIB_THEME_NAME = 'mvui-stdlib';

export const theme = style.themeVariables(MVUI_STDLIB_THEME_NAME, lightTheme);
