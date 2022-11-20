import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable, Subject } from "./observables";
import { camelToDash } from "./util/strings";
import { applyCSSStyleDeclaration } from "./util/css";
import { CONFIG } from "./const";
import { throttle } from "./util/time";
import TwoWayMap from "./util/two-way-map";

export default abstract class Component extends HTMLElement {

  protected abstract render(): TemplateElement<any>[];

  // ----------------------------------------------------------------------
  // attribute reflection
  // ----------------------------------------------------------------------

  private attrReflectionObserver = new MutationObserver((mutationList, _observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes') {
        if (this.reflectIgnoreNextAttributeChange) {
          this.reflectIgnoreNextAttributeChange = false;
          return;
        };
        if (mutation.attributeName === null) return;
        const prop = this.reflectedAttributes.get(mutation.attributeName);
        if (prop) {
          (this as any)[prop] = this.getAttribute(mutation.attributeName);
          console.log(`The ${mutation.attributeName} attribute was modified.`);
        }
      }
    }
  });

  // attr name -> prop name
  private reflectedAttributes = new TwoWayMap<string, string>();
  private reflectIgnoreNextAttributeChange = false;
  private reflectAttribute(name: string, value: string) {
    this.reflectIgnoreNextAttributeChange = true;
    super.setAttribute(name, value);
  }

  constructor() {
    super();
    this.attrReflectionObserver.observe(this, {attributes: true});
  }

  // ----------------------------------------------------------------------
  // lifecycle
  // ----------------------------------------------------------------------

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

  static new<T extends Component>(
    this: Constructor<T>,
    childrenOrProps?: TemplateElement<T>['children'] | TemplateElement<T>['props'],
    children?: TemplateElement<T>['children'],
  ): TemplateElement<T> {
    const thisEl = (new (this as any)() as T);

    for (let key in thisEl.props) {
      // console.log(`defining ${key}`);
      Object.defineProperty(thisEl, key, {
        set(v: any) {
          thisEl.props[key].next(v);
          const attr = thisEl.reflectedAttributes.getReverse(key);
          console.log(attr, thisEl.reflectedAttributes);
          if (attr) thisEl.reflectAttribute(attr, v);
        },
        get() { return thisEl.props[key].value }
      });
    }

    return new TemplateElement(
      () => thisEl,
      childrenOrProps, children
    );
  }

  // ----------------------------------------------------------------------
  // (public) reactive properties
  // ----------------------------------------------------------------------

  private props: { [key: string]: Subject<any> } = {};

  /** Define a reactive instance property based on a subject. */
  protected publicProp<T>(
    name: string, subj$: Subject<T>,
    reflectToAttribute: boolean | string = true
  ) {
    this.props[name] = subj$;
    if (typeof reflectToAttribute === 'string') {
      this.reflectedAttributes.set(reflectToAttribute, name);
    } else if (reflectToAttribute === true) {
      this.reflectedAttributes.set(name, name);
    }
    return undefined as T;
  }

  protected unsubscribers: (() => void)[] = [];
  protected subscribe<T>(obs: Observable<any>, observer: ((value: T) => void)) {
    this.unsubscribers.push(obs.subscribe(
      !CONFIG.APP_DEBUG ? observer : v => { this.flash(); return observer(v) }
    ));
  }

  // ----------------------------------------------------------------------
  // debugging
  // ----------------------------------------------------------------------

  private flash = throttle((color = "blue") => {
    const prevOutline = this.style.outline;
    this.style.outline = `1px solid ${color}`;
    setTimeout(() => this.style.outline = prevOutline, 400);
  }, 500);

  // ----------------------------------------------------------------------
  // rendering
  // ----------------------------------------------------------------------

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
