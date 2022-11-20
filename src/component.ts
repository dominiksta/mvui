import TemplateElement from "./template-element";
import { Constructor } from "./util/types";

// function _Component<T extends HTMLElement>(baseElement: Newable<T>) {
//   return class extends baseElement {
//
//   }
// }

export default abstract class Component extends HTMLElement {

  protected abstract render(): TemplateElement<any>[];

  connectedCallback() {
    const toDisplay = this.render();
    for (let el of toDisplay) {
      this.appendChild(el.render());
    }
  }

  disconnectedCallback() {
  }

  static new<T extends HTMLElement>(
    this: Constructor<T>,
    childrenOrProps?: TemplateElement<any>['children'] | TemplateElement<any>['children'],
  ): TemplateElement<T> {
    console.log(childrenOrProps);
    return new TemplateElement(
      () => (new (this as any)() as T),
    );
  }

}
