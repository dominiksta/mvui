import { filter, fromDOMMutations, tap, throttleTime } from "../rx";
import { util } from "./general";
import { MvuiCSSSheet } from "./general";

/** @internal */
export function pierceShadow(
  sheet: MvuiCSSSheet, sr: ShadowRoot, name: string,
) {
  name = `component-pierce-${name}`;
  util.applySheetAsStyleTag(sr.host as HTMLElement, sheet, name, true);

  // We listen for DOM mutations here because we cannot really know when a
  // component has finished rendereing. For mvui componente we could, but not for
  // third party components, which may even decide to render asynchronously.
  fromDOMMutations(
    sr, { childList: true, subtree: true }
  ).pipe(
    filter(mut => mut.type === 'childList'),
    throttleTime(10),
    tap(_ => {
      // console.log(isParentRoot(this, v.el));
      // console.log(mut, v.styles);
      util.applySheetAsStyleTag(sr.host as HTMLElement, sheet, name, true)
    })
  ).subscribe();
  // Subscribing directly here should not be a memory leak. If the node in
  // question is disconnected from the DOM and there are no other references to
  // it, only this MutationObserver will have a reference. We don't store
  // references to these MutationObservers through, so they should be
  // handled by GC together with the node.
}
