import { MulticastStream, Stream } from "../rx";
import { singletonValue } from "./other";

export function getParentRoot(node: Node): Node {
  const gotten = node.getRootNode();
  if (gotten instanceof ShadowRoot) return gotten.host;
  return gotten;
}

export function getParentNode(node: Node): Node | null {
  const gotten = node.parentNode;
  if (gotten instanceof ShadowRoot) return gotten.host;
  return gotten;
}

/**
   Check if a given child is contained within parent using getRootNode. This will not
   traverse the entire DOM and will instead "jump" from root node to root node, hopefully
   saving some time. Useful to check wether an element is a child of a component.
 */
export function isParentRoot(parent: Node, child: Node): boolean {
  let current = getParentRoot(child);

  while (current !== getParentRoot(current)) {
    if (current === parent) return true;
    current = getParentRoot(current);
  }

  return false;
}

function fromCustomElementConnected() {
  return new Stream<HTMLElement>(observer => {
    const oldDefine = customElements.define;
    customElements.define = function mvuiMonkeyPatchCustomElementsDefine(
      this, name: string, constructor: CustomElementConstructor,
      options?: ElementDefinitionOptions
    ) {
      const oldConnectedCb =
        constructor.prototype.connectedCallback ?? (() => null);
      constructor.prototype.connectedCallback =
        function mvuiMonkeyPatchConnectedCallback(this) {
          const ret = oldConnectedCb.bind(this)();
          observer.next(this);
          return ret;
        }
      const ret = oldDefine.bind(this)(name, constructor, options);
      return ret;
    }

    return function cleanup() {
      customElements.define = oldDefine;
    }
  });
}

export const customElementConnected = singletonValue(() => {
  const mc = new MulticastStream<HTMLElement>();
  fromCustomElementConnected().subscribe(mc);
  return mc;
})
