import { style } from "@mvui/core";

const stdLibThemeKeys = [
  'bg',
  'bgContrast10',
  'fg',
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
  bgContrast10: '#f0f0f0',
  fg: 'black',
  primary: 'blue',
  accent: '#ff4081',
}

export const darkTheme: StdLibTheme = {
  ...baseTheme,
  bg: '#222222',
  bgContrast10: '#555555',
  fg: 'white',
  primary: 'blue',
  accent: '#ff4081',
}

export const MVUI_STDLIB_THEME_NAME = 'mvui-stdlib';

const theme = style.themeVariables(MVUI_STDLIB_THEME_NAME, lightTheme);
export default theme;
