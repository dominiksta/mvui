import { MVUI_GLOBALS } from "../globals";

/**
   A common complaint about web components is that their names must be globally unique.
 */
export default function configurePrefixes(
  prefixes: { [key: string]: string }
) {
  console.log(MVUI_GLOBALS);
  MVUI_GLOBALS.PREFIXES = new Map<string, string>();
  MVUI_GLOBALS.PREFIXES.set('default', 'app');
  for (let libName in prefixes) MVUI_GLOBALS.PREFIXES.set(libName, prefixes[libName]);
}
