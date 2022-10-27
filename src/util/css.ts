/** Apply `styles` to `el` */
export function applyCSSStyleDeclaration(
  el: HTMLElement, styles: Partial<CSSStyleDeclaration>
) {
  for (let key in styles) el.style[key] = styles[key] as any;
}
