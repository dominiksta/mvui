import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable, Subject } from "./observables";
import { camelToDash } from "./util/strings";
import { CONFIG } from "./const";
import { throttle } from "./util/time";
import TwoWayMap from "./util/two-way-map";
import Styling, { MvuiCSSSheet } from "./styling";

export default abstract class Component<
  CustomEventsT extends { [key: string]: any } = {}
> extends HTMLElement {

  protected abstract render(): TemplateElement<any>[];

  protected static useShadow: boolean = true;
  protected static tagNameSuffix?: string;

  // ----------------------------------------------------------------------
  // styling
  // ----------------------------------------------------------------------

  /**
   * Settings this static property is the primary way of styling a component. The instance
   * level styles property should only be used for actual instance scoped styles for
   * performance reasons. A typical use would look like this:
   *
   * ```{typescript}
   * static styles = Component.css({
   *   'button': {
   *     'background': 'red'
   *   }
   * })
   * ```
   */
  protected static styles: MvuiCSSSheet;
  protected styles = new Subject<MvuiCSSSheet>([]);

  private setInstanceStyles(sheet: MvuiCSSSheet) {
    let el = (this.shadowRoot || this).querySelector<HTMLStyleElement>(
      '.mvui-instance-styles'
    );
    if (!el) {
      el = document.createElement('style');
      el.className = 'mvui-instance-styles';
      el.nonce = CONFIG.STYLE_SHEET_NONCE;
      (this.shadowRoot || this).appendChild(el);
    }
    el.innerHTML = Styling.sheetToString(sheet);
  }

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
          // console.log(`The ${mutation.attributeName} attribute was modified.`);
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

  // ----------------------------------------------------------------------
  // initialization
  // ----------------------------------------------------------------------

  constructor() {
    super();

    if ((this.constructor as any).useShadow && !this.shadowRoot) {
      this.attachShadow({mode: 'open'});
    }

    this.attrReflectionObserver.observe(this, {attributes: true});

    this.styles.subscribe(this.setInstanceStyles.bind(this));

    this.onCreated();
  }

  static register(prefix?: string) {
    if (!this.tagNameSuffix)
      this.tagNameSuffix = camelToDash(this.name).substring(1);
    customElements.define(
      (prefix && prefix.length !== 0) ?
      `${prefix}-${this.tagNameSuffix}` : `mvui-${this.tagNameSuffix}`,
      this as any
    );
  }

  // ----------------------------------------------------------------------
  // lifecycle
  // ----------------------------------------------------------------------

  protected onCreated() { }
  protected onAdded() { }
  protected onRender() { }
  protected onRemoved() { }

  connectedCallback() {
    this.onAdded();
    CONFIG.APP_DEBUG && this.flash('green');

    (this.shadowRoot || this).innerHTML = '';

    if ((this.constructor as any).styles) {
      Styling.applySheet(
        Styling.sheetToString((this.constructor as any).styles), this
      );
    }

    const toDisplay = this.render();
    for (let el of toDisplay) {
      (this.shadowRoot || this).appendChild(this._renderTemplate(el));
    }

    for (let ref of this.templateRefs) ref.resolve(ref.query());

    this.onRender();
  }

  disconnectedCallback() {
    this.onRemoved();
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
          // console.log(attr, thisEl.reflectedAttributes);
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
          const attrVal = (el as any).props.attrs[attr]
          // the camelToDash transformations here are actually not an mvui specific
          // assumption: html attributes are forced to be all lowercase by the browser
          if (attrVal instanceof Observable) {
            this.subscribe(
              attrVal, v => {
                thisEl.setAttribute(camelToDash(attr), v as string)
                // console.debug("next");
              }
            );
          } else {
            thisEl.setAttribute(
              camelToDash(attr), (el as any).props.attrs[attr] as string
            );
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
      if (el.props.style) Styling.applySingleElement(thisEl, el.props.style);
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

  // ----------------------------------------------------------------------
  // template references (aka querySelector/All)
  // ----------------------------------------------------------------------

  private templateRefs: {
    resolve: (value: any) => void, query: () => any
  }[] = [];

  query<T extends HTMLElement>(query: string, force: false): Promise<T | null>;
  query<T extends HTMLElement>(query: string, force?: true): Promise<T>;
  query<T extends HTMLElement>(
    query: string, force: boolean = true
  ): Promise<T | null> {
    return new Promise<T>(resolve => {
      this.templateRefs.push({
        resolve,
        query: () => {
          const res = (this.shadowRoot || this).querySelector<T>(query);
          if (force && res === null) throw new Error(
            `Query '${query}' in component ${this.tagName.toLowerCase()}` +
              ` did not return results but was set to force`
          );
          return res;
        }
      });
    });
  }

  queryAll<T extends HTMLElement>(
    query: string, force: false
  ): Promise<NodeListOf<T> | null>;
  queryAll<T extends HTMLElement>(
    query: string, force?: true
  ): Promise<NodeListOf<T>>;
  queryAll<T extends HTMLElement>(
    query: string, force: boolean = true
  ): Promise<NodeListOf<T> | null> {
    return new Promise(resolve => {
      this.templateRefs.push({
        resolve,
        query: () => {
          const res = (this.shadowRoot || this).querySelectorAll<T>(query);
          if (force && res.length === 0) throw new Error(
            `Query '${query}' in component ${this.tagName.toLowerCase()}` +
              ` did not return results but was set to force`
          );
          return res;
        }
      });
    });
  }


}

/** Helper type to infer the custom events of a Component */
type ComponentTemplateElement<
  CompT extends Component<any>,
> = TemplateElement<CompT, CompT extends Component<infer I> ? I : never>;
