import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import { Observable, Subject, Prop } from "./rx";
import { camelToDash } from "./util/strings";
import { CONFIG } from "./const";
import { throttle } from "./util/time";
import Styling, { MvuiCSSSheet } from "./styling";

/**
 * The heart of mvui. Every mvui component is defined by inheriting from this class.
 *
 * @example
 * ```typescript
 * export class CounterComponent extends Component {
 *   private count = new Subject(0);
 *
 *   render = () => [
 *     Html.p([
 *       Html.button({ events: {
 *         click: _ => this.count.next(this.count.value + 1)
 *       }}, 'Increment'),
 *       Html.span(this.count.map(v => `count: ${v}`))
 *     ])
 *   ];
 * }
 * ```
 */
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
   * ```typescript
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
  // (public) reactive properties & attribute reflection
  // ----------------------------------------------------------------------

  props: { [name: string]: Prop<any> } = {};

  private static _setPropAndMaybeReflect(
    thisEl: Component, prop: string, value: any
  ) {
    if (!(prop in thisEl.props)) throw new Error(
      'Attempted to set non-existant property'
    );
    const p: Prop<any> = (thisEl.props as any)[prop];
    p.next(value);
    if (typeof p._options.reflect === "string") {
      thisEl.reflectAttribute(
        p._options.reflect,
        p._options.converter.toString(p.value)
      )
    } else if (p._options.reflect === true) {
      thisEl.reflectAttribute(
        camelToDash(prop),
        p._options.converter.toString(p.value)
      )
    }
  }

  private attrReflectionObserver = new MutationObserver((mutationList, _observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes') {
        if (this.reflectIgnoreNextAttributeChange) {
          this.reflectIgnoreNextAttributeChange = false;
          return;
        };
        if (mutation.attributeName === null) return;

        for (let k of Object.keys(this.props)) {
          const reflect = this.props[k]._options.reflect;
          if (reflect === false) continue;
          const reflectedAttrName = reflect === true ? camelToDash(k) : reflect;
          if (reflectedAttrName === mutation.attributeName) {
            // console.debug(`The ${mutation.attributeName} attribute was modified.`);
            this.props[k].next(this.props[k]._options.converter.fromString(
              this.getAttribute(mutation.attributeName)!
            ));
          }
        }
      }
    }
  });

  private reflectIgnoreNextAttributeChange = false;
  private reflectAttribute(name: string, value: string) {
    // console.debug(`reflecting attribute ${name} to ${value}`);
    this.reflectIgnoreNextAttributeChange = true;
    this.setAttribute(name, value);
  }

  // ----------------------------------------------------------------------
  // initialization
  // ----------------------------------------------------------------------

  private lifecycleState: "created" | "added" | "rendered" | "removed"
    = "created";

  constructor() {
    super();

    if ((this.constructor as any).useShadow && !this.shadowRoot) {
      this.attachShadow({mode: 'open'});
    }

    this.attrReflectionObserver.observe(this, {attributes: true});

    this.styles.subscribe(this.setInstanceStyles.bind(this));

    this.lifecycleState = "created"; this.onCreated();
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

  private connectedCallback() {
    this.lifecycleState = "added"; this.onAdded();
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

    this.lifecycleState = "rendered"; this.onRender();
  }

  private disconnectedCallback() {
    this.lifecycleState = "removed"; this.onRemoved();
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
    childrenOrParams?: ComponentTemplateElement<T>['children'] |
      ComponentTemplateElement<T>['params'],
    children?: ComponentTemplateElement<T>['children'],
  ): ComponentTemplateElement<T> {
    const thisEl = (new (this as any)() as T);

    return new TemplateElement<T, E>(
      () => thisEl,
      childrenOrParams, children
    ) as ComponentTemplateElement<T>;
  }

  /**
   * Returns a new constructor that will create a more "normal" webcomponent from an mvui
   * component. Specifically, this means mapping the `props` field to individual class
   * fields. This enables better compatibility with other frameworks.
   *
   * @example
   * ```typescript
   * class _MyComponent extends Component {
   *   props = { value: new Subject(0) };
   * }
   * const MyComponent _MyComponent.export();
   * export default MyComponent;

   * // --- usage ----
   * const myComp = new MyComponent();
   * myComp.value = 10; // will trigger an update
   * ```
   */
  static export<T extends Component>(
    this: Constructor<T>
  ): Constructor<
    T & { [key in keyof T['props']]:
      T['props'][key] extends Subject<infer I> ? I : never }
  > {
    const original = this; // reference to original constructor

    // new constructor behaviour
    const f: any = function(this: any, ...args: any[]) {
      const instance: any = original.apply(this, args)

      for (let p in instance.props) {
        Object.defineProperty(instance, p, {
          get() { return instance.props[p].value; },
          set(v: any) {
            Component._setPropAndMaybeReflect(instance, p, v);
          }
        });
      }

      return instance;
    }

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    return f; // return new constructor
  }

  // ----------------------------------------------------------------------
  // automatic unsubscribing on unmount
  // ----------------------------------------------------------------------

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
   * Dispatch an event specified in the generic CustomEventsT parameter. All events will
   * be dispatched as an instance of `CustomEvent` with `detail` set to `value`.
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

    // --- setup attributes, events, props, class fields
    if (el.params) {
      if (el.params.attrs) {
        for (let attr in el.params.attrs) {
          const attrVal = (el as any).params.attrs[attr]
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
              camelToDash(attr), (el as any).params.attrs[attr] as string
            );
          }
        }
      }
      if (el.params.events) {
        for (let key in el.params.events) {
          thisEl.addEventListener(key, (el.params.events as any)[key]);
        }
      }

      if (el.params.fields) {
        for (let prop in el.params.fields) {
          const val = el.params.fields[prop];
          if (val instanceof Observable) {
            this.subscribe(val, (v) => {(thisEl as any)[prop] = v});
          } else { (thisEl as any)[prop] = val; }
        }
      }

      if (el.params.props) {
        if (!(thisEl instanceof Component)) throw new Error(
          'Attempted to set props on a template element that is not an mvui ' +
          'component'
        );
        for (let prop in el.params.props) {
          const val = (el.params.props as any)[prop];
          if (val instanceof Observable) {
            this.subscribe(val, (v) => {
              Component._setPropAndMaybeReflect(thisEl, prop, v);
            });
          } else {
            Component._setPropAndMaybeReflect(thisEl, prop, val);
          }
        }
      }

      if (el.params.style) Styling.applySingleElement(thisEl, el.params.style);
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

  async query<T extends HTMLElement>(query: string, force: false): Promise<T | null>;
  async query<T extends HTMLElement>(query: string, force?: true): Promise<T>;
  async query<T extends HTMLElement>(
    query: string, force: boolean = true
  ): Promise<T | null> {
    const queryFun = () => {
      const res = (this.shadowRoot || this).querySelector<T>(query);
      if (force && res === null) throw new Error(
        `Query '${query}' in component ${this.tagName.toLowerCase()}` +
        ` did not return results but was set to force`
      );
      return res;
    };
    if (this.lifecycleState === "rendered") return queryFun();
    return new Promise<T>(resolve => {
      this.templateRefs.push({ resolve, query: queryFun });
    });
  }

  async queryAll<T extends HTMLElement>(
    query: string, force: false
  ): Promise<NodeListOf<T> | null>;
  async queryAll<T extends HTMLElement>(
    query: string, force?: true
  ): Promise<NodeListOf<T>>;
  async queryAll<T extends HTMLElement>(
    query: string, force: boolean = true
  ): Promise<NodeListOf<T> | null> {
    const queryFun = () => {
      const res = (this.shadowRoot || this).querySelectorAll<T>(query);
      if (force && res.length === 0) throw new Error(
        `Query '${query}' in component ${this.tagName.toLowerCase()}` +
        ` did not return results but was set to force`
      );
      return res;
    };
    if (this.lifecycleState === "rendered") return queryFun();
    return new Promise(resolve => {
      this.templateRefs.push({ resolve, query: queryFun });
    });
  }


}

/** Helper type to infer the custom events of a Component */
type ComponentTemplateElement<
  CompT extends Component<any>,
> = TemplateElement<
  CompT,
  CompT extends Component<infer I> ? I : never,
  CompT,
  { [key in keyof CompT['props']]:
    CompT['props'][key] extends Subject<infer I> ? I : never }
>;