import Stream from "../../stream";

/**
   Listen to all events from a MutationObserver on a given DOM element.
 */
export default function fromDOMMutations(
  el: HTMLElement | ShadowRoot, options?: MutationObserverInit
): Stream<MutationRecord> {
  return new Stream(streamObserver => {
    const mutObserver = new MutationObserver(mutationList => {
      mutationList.forEach(streamObserver.next);
    });
    mutObserver.observe(el, options);

    return () => mutObserver.disconnect();
  })
}
