import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable } from "./observables";
import { camelToDash } from "./util/strings";
import { applyCSSStyleDeclaration } from "./util/css";
import { CONFIG } from "./const";
import { throttle } from "./util/time";

export default abstract class Component extends HTMLElement {

  protected abstract render(): TemplateElement<any>[];

  connectedCallback() {
    CONFIG.APP_DEBUG && this.flash('green');
    const toDisplay = this.render();
    for (let el of toDisplay) {
      this.appendChild(this._renderTemplate(el));
    }
  }

  disconnectedCallback() {
    CONFIG.APP_DEBUG && this.flash('red');
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
    this.unsubscribers.push(obs.subscribe(
      !CONFIG.APP_DEBUG ? observer : v => { this.flash(); return observer(v) }
    ));
  }

  private flash = throttle((color = "blue") => {
    const prevOutline = this.style.outline;
    this.style.outline = `1px solid ${color}`;
    setTimeout(() => this.style.outline = prevOutline, 400);
  }, 500);

  private _renderTemplate<T extends HTMLElement>(el: TemplateElement<T>) {
    const thisEl = el.creator();

    // --- setup attributes, properties, events
    if (el.props) {
      if (el.props.attrs) {
        for (let attr in el.props.attrs) {
          const attrVal = el.props.attrs[attr]
          if (attrVal instanceof Observable) {
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
      if (el.props.events) {
        for (let key in el.props.events) {
          thisEl.addEventListener(key.substring(2), (el.props.events as any)[key]);
        }
      }
      if (el.props.instance) {
        for (let prop in el.props.instance) {
          const instanceVal = el.props.instance[prop];
          if (instanceVal instanceof Observable) {
            this.subscribe(instanceVal, (v) => {
              (thisEl as any)[prop] = v
            });
          } else {
            (thisEl as any)[prop] = el.props.instance[prop];
          }
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
            if (v instanceof Array && v[0] instanceof TemplateElement) {
              thisEl.innerHTML = '';
              for (let child of v) thisEl.appendChild(this._renderTemplate(child));
            } else if (v instanceof TemplateElement) {
              thisEl.innerHTML = '';
              thisEl.appendChild(this._renderTemplate(v));
            } else {
              thisEl.innerText = v as string;
            }
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
