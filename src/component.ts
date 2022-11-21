import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable, Subject } from "./observables";
import { camelToDash } from "./util/strings";
import { applyCSSStyleDeclaration } from "./util/css";
import { CONFIG } from "./const";
import { throttle } from "./util/time";
import TwoWayMap from "./util/two-way-map";

export default abstract class Component<
  CustomEventsT extends { [key: string]: any } = {}
> extends HTMLElement {

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

  /**
   * This is a hack needed to infer the type of custom events of subclasses of components.
   *
   * Minimal example of what this is about:
   *
   * ```
   * export class A<T> { t?: T; }
   * class C extends A<{'lala': 4}> {}
   *
   * type ExtractGeneric<T> = T extends A<infer X> ? X : never;
   *
   * function f<T1 extends A<T2>, T2 = ExtractGeneric<T1>>(a: T1): T2 {
   *   return undefined as T2;
   * }
   *
   * const result = f(new C());
   * const result2 = f(new A<number>());
   * ```
   *
   * Try removing the t? in class A and see how the type system complains. To be hones, I
   * have no idea why this is happening but it is.
   *
   * @internal
   */
  private __t?: CustomEventsT;

  /** Get a new {@link TemplateElement} for use in a {@link render} method. */
  static new<
    T extends Component<E>,
    E extends { [key: string]: any } = T extends Component<infer I> ? I : never
  >(
    // A note on the implementation: In order for the type inference of the custom events
    // generic parameter to work, we must not use `E` anywhere in the parameters to this
    // method. Otherwise, E would be be bound by the parameters we pass when calling this
    // function instead of being infered from T. This is the only reason why
    // {@link ComponentTemplateElement} exists.
    this: Constructor<T>,
    childrenOrProps?: ComponentTemplateElement<T>['children'] |
      ComponentTemplateElement<T>['props'],
    children?: ComponentTemplateElement<T>['children'],
  ): ComponentTemplateElement<T> {
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

    return new TemplateElement<T, E>(
      () => thisEl,
      childrenOrProps, children
    ) as ComponentTemplateElement<T>;
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
  // events
  // ----------------------------------------------------------------------

  /**
   * Dispatch an event specified in the generic {@link CustomEventsT} parameter. All
   * events will be dispatched as an instance of `CustomEvent` with `detail` set to
   * `value`.
   */
  protected dispatch<T extends keyof CustomEventsT>(
    name: T, value: CustomEventsT[T]
  ) {
    if (typeof name !== 'string') return;
    this.dispatchEvent(new CustomEvent(name, { detail: value }));
  }

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
          thisEl.addEventListener(key, (el.props.events as any)[key]);
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

/** Helper type to infer the custom events of a Component */
type ComponentTemplateElement<
  CompT extends Component<any>,
> = TemplateElement<CompT, CompT extends Component<infer I> ? I : never>;
