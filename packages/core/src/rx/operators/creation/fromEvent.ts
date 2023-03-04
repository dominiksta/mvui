import Stream from "../../stream";

/**
 * TODO
 */
export default function fromEvent<T extends keyof HTMLElementEventMap>(
  el: HTMLElement, eventType: T
): Stream<HTMLElementEventMap[T]> {
  return new Stream(observer => {
    const listener = observer.next.bind(observer);

    el.addEventListener(eventType, listener);
    
    return function teardown() {
      el.removeEventListener(eventType, listener);
    }
  })
}
