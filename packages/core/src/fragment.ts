import { TemplateElement } from "./template-element";
import { Stream } from "./rx";

/** @see {@link fragment} */
export class Fragment<T> {
  #id: string;
  get id() { return this.#id; }

  static readonly MARKER = '__mvui_fragment';

  constructor(
    public stream: Stream<T>,
    public template: (value: T) => TemplateElement<any>[]
  ) {
    this.#id = crypto.randomUUID();
  }
}


/**
   Fragments can group elements together in you template without grouping them in the
   DOM. They serve the same purpose they also do in other frameworks such as React.

   @example
   ```typescript
   class MyComponent extends Component {
     render() {
       const list = new rx.State([1, 2]);
       return [
         // This will render like so in the DOM:
         //
         // <div>1</div>
         // <div>2</div>
         // <div>2</div>
         // <div>3</div>
         //
         // Notice how there are no grouping elements around the divs.
         list.derive(n => h.fragment([ h.div(n), h.div(n + 1) ]))
       ]
     }
   }
   ```
 */
export function fragment<T>(
  stream: Stream<T>, template: (value: T) => TemplateElement<any>[]
): Fragment<T> {
  return new Fragment(stream, template);
}
