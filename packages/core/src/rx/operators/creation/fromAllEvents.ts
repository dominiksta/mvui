import Stream from "../../stream";

// see GlobalEventHandlersEventMap for a list of potentially relevant events

// might be interesting, but should not be necessary:
// auxclick, dblclick, copy, focusin, focusout, mousedown, mouseup, wheel
const RELEVANT_EVENTS = [
  'change', 'blur', 'click', 'contextmenu', 'cut', 'focus', 'keydown',
  'keyup', 'paste', 'pointerdown', 'pointerup', 'wheel'
];

// https://stackoverflow.com/a/22545622
const RESERVED_ELEMENT_NAMES = [
  'annotation-xml', 'color-profile', 'font-face', 'font-face-src',
  'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph',
];

function isCustomElement(tagName: string): boolean {
  return tagName.includes('-') &&
    RESERVED_ELEMENT_NAMES.indexOf(tagName) === -1;
}

/**
   TODO

   @group Stream Creation Operators
 */
export default function fromAllEvents<T extends HTMLElement>(
  el: T
): Stream<Event> {
  return new Stream(observer => {
    const listener = observer.next.bind(observer);

    let originalDispatch = el.dispatchEvent.bind(el);

    // console.log(el.tagName.includes('-'))
    if (isCustomElement(el.tagName)) {
      // is web component
      // console.debug(`${el.tagName} is web component`);
      el.dispatchEvent = (e: Event) => {
        observer.next(e);
        return originalDispatch(e);
      };
    } else {
      // console.debug(`${el.tagName} is builtin`);
      // is built in element
      for (let evtName of RELEVANT_EVENTS)
        el.addEventListener(evtName, listener);
    }
    
    return function teardown() {
      if (customElements.get(el.tagName) !== undefined) {
        // is web component
        el.dispatchEvent = originalDispatch;
      } else {
        // is built in element
        for (let evtName of RELEVANT_EVENTS)
          el.removeEventListener(evtName, listener);
      }
    }
  })
}
