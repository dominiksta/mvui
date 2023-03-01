import { style } from "@mvui/core";

const stdLibThemeKeys = [
  'bg',
  'bgContrast10',
  'fg',
  'primary', 'accent',
  'font'
] as const;
type StdLibTheme = { [key in typeof stdLibThemeKeys[number]]: string };

const baseTheme = {
  font: 'monospace',
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

style.setTheme('mvui-stdlib', lightTheme);


style.currentTheme$.subscribe(theme => {
  if (theme === 'dark')
    style.setTheme('mvui-stdlib', darkTheme);
  if (theme === 'light')
    style.setTheme('mvui-stdlib', lightTheme);
})

const theme = style.themeVariables('mvui-stdlib', lightTheme);
export default theme;
