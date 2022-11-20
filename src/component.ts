import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable } from "./observables";
import { camelToDash } from "./util/strings";
import { applyCSSStyleDeclaration } from "./util/css";

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
      this.appendChild(this._renderTemplate(el));
    }
  }

  disconnectedCallback() {
    for (let unsub of this.unsubscribers) unsub();
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

  protected unsubscribers: (() => void)[] = [];
  protected subscribe<T>(obs: Observable<any>, observer: ((value: T) => void)) {
    this.unsubscribers.push(obs.subscribe(observer));
  }

  private _renderTemplate<T extends HTMLElement>(el: TemplateElement<T>) {
    const thisEl = el.creator();

    // --- setup attributes, properties, events
    if (el.props) {
      if (el.props.attrs) {
        for (let attr in el.props.attrs) {
          const attrVal = el.props.attrs[attr]
          if (attrVal instanceof Function && attr.startsWith('on')) {
            thisEl.addEventListener(attr.substring(2), attrVal as any);
          } else if (attrVal instanceof Observable) {
            this.subscribe(
              attrVal, v => {
                thisEl.setAttribute(camelToDash(attr), v as string)
                // console.debug("next");
              }
            );
          } else {
            thisEl.setAttribute(camelToDash(attr), el.props.attrs[attr] as string);
          }
        }
      }
      if (el.props.instance) {
        for (let prop in el.props.instance) {
          (thisEl as any)[prop] = el.props.instance[prop];
        }
      }
      if (el.props.style) applyCSSStyleDeclaration(thisEl, el.props.style);
    }

    // --- recurse
    if (el.children) {
      if (typeof el.children === 'string') {
        thisEl.innerText = el.children;
      } else if (el.children instanceof Observable) {
        this.subscribe(
          el.children, v => {
            thisEl.innerText = v as string;
            // console.debug("next");
          }
        );
      } else if (el.children instanceof TemplateElement) {
        thisEl.appendChild(this._renderTemplate(el.children));
      } else if (el.children instanceof Array) {
        for (let child of el.children) {
          thisEl.appendChild(this._renderTemplate(child));
        }
      }
    }

    return thisEl;
  }


}
