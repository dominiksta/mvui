import TemplateElement from "./template-element";
import { Constructor } from "./util/types";
import {
  Stream, State, Prop,
  fromAllEvents, map, distinctUntilChanged, skip
} from "./rx";
import { camelToDash } from "./util/strings";
import { MVUI_GLOBALS } from "./globals";
import { throttle } from "./util/time";
import * as style from "./style";
import { BIND_MARKER } from "./rx/bind";

// these symbols are used for properties that should be accessible from anywhere in mvui
// but should not be part of api surface
const STYLE_OVERRIDES = Symbol();

/**
 * The heart of mvui. Every mvui component is defined by inheriting from this class.
 *
 * @example
 * ```typescript
 * export class CounterComponent extends Component {
 *   private count = new rx.State(0);
 *
 *   render = () => [
 *     h.p([
 *       h.button({ events: {
 *         click: _ => this.count.next(this.count.value + 1)
 *       }}, 'Increment'),
 *       h.span(this.count.map(v => `count: ${v}`))
 *     ])
 *   ];
 * }
 * ```
 */
export default abstract class Component<
  CustomEventsT extends { [key: string]: any } = {}
> extends HTMLElement {

  protected abstract render(): TemplateElement<any, any, any, any>[];

  protected static useShadow: boolean = true;
  protected static tagNameSuffix?: string;
  protected static tagNameLibrary?: string;

  // ----------------------------------------------------------------------
  // styling
  // ----------------------------------------------------------------------

  /**
   * Settings this static property is the primary way of styling a component. The instance
   * level {@link Component#styles} property should only be used for actual instance
   * scoped styles for performance reasons
   *
   * @example
   * A simple sheet
   * ```typescript
   * static styles = style.sheet({
   *   'button': {
   *     'background': 'red'
   *   }
   * })
   * ```
   *
   * @example
   * Sharing styles
   * ```typescript
   * const SOME_SHARED_STYLES = style.sheet({
   *   'button': {
   *     'background': 'yellow', // will be overwritten by the component style sheet
   *     'padding': '10px',
   *   }
   * });
   * class MyComponent extends Component {
   *   static styles = [
   *     ...SOME_SHARED_STYLES,
   *     ...style.sheet({
   *       'button': {
   *         background: 'red',
   *       },
   *       'button:active': {
   *         background: 'green',
   *       },
   *     }),
   *   ]
   *   // ...
   * }
   * ```
   *
   * @example
   * Using \@rules (for example media queries)
   * ```typescript
   * static styles = [
   *   ...style.sheet({
   *     'button': {
   *       background: 'red',
   *     },
   *     'button:active': {
   *       background: 'green',
   *     },
   *   }),
   *   style.at.media('screen and (min-width: 900px)', style.sheet({
   *     'button': {
   *       borderRadius: '10px',
   *     }
   *   })),
   * ]
   * ```
   */
  protected static styles?: style.MvuiCSSSheet;

  /**
   * Settings the static {@link Component.styles} property is the primary way of styling a
   * component. This instance level styles property should only be used for actual
   * instance scoped styles for performance reasons.
   *
   * @example
   * ```typescript
   * render = () => [
   *   h.button({
   *     events: { click: _ => {
   *       this.styles.next(style.sheet({
   *         'button': {
   *           background: 'brown !important',
   *         }
   *       }));
   *     }}
   *   }, 'Styled Button'),
   * ]
   * ```
   */
  protected styles = new State<style.MvuiCSSSheet>([]);

  [STYLE_OVERRIDES]: style.MvuiCSSSheet = [];

  // ----------------------------------------------------------------------
  // (public) reactive properties & attribute reflection
  // ----------------------------------------------------------------------

  props: { [name: string]: Prop<any> } = {};

  private _maybeReflectToAttribute(
    prop: string, value: any
  ) {
    if (!(prop in this.props)) throw new Error(
      'Attempted to set non-existant property'
    );
    // console.debug(`maybe reflect ${prop} to attribute with ${value}`)
    const p: Prop<any> = (this.props as any)[prop];
    if (typeof p._options.reflect === "string") {
      this.reflectAttribute(
        p._options.reflect,
        p._options.converter.toString(p.value)
      )
    } else if (p._options.reflect === true) {
      this.reflectAttribute(
        camelToDash(prop),
        p._options.converter.toString(p.value)
      )
    }
  }

  private _maybeReflectToProp(attrName: string) {
    // console.debug(`The ${attrName} attribute was modified.`);
    for (let k of Object.keys(this.props)) {
      const reflect = this.props[k]._options.reflect;
      if (reflect === false) continue;
      const reflectedAttrName = reflect === true ? camelToDash(k) : reflect;
      if (reflectedAttrName === attrName) {
        this.props[k].next(this.props[k]._options.converter.fromString(
          this.getAttribute(attrName)!
        ));
      }
    }
  }

  private attrReflectionObserver = new MutationObserver((mutationList, _observer) => {
    for (const mutation of mutationList) {
      // console.debug(new Date(), `mutation ${mutation.attributeName}, ignore =`,
      // this.reflectIgnoreNextAttributeChange);
      if (mutation.type === 'attributes') {
        if (this.reflectIgnoreNextAttributeChange) {
          this.reflectIgnoreNextAttributeChange = false;
          return;
        };
        if (mutation.attributeName === null) return;
        this._maybeReflectToProp(mutation.attributeName);
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

    this.lifecycleState = "created"; this.onCreated();
  }

  static register() {
    if (!this.tagNameSuffix)
      this.tagNameSuffix = camelToDash(this.name).substring(1);

    let prefix;
    if (this.tagNameLibrary) {
      prefix = MVUI_GLOBALS.PREFIXES.get(this.tagNameLibrary) ??
               this.tagNameLibrary;
    } else {
      prefix = MVUI_GLOBALS.PREFIXES.get('default');
    }

    customElements.define(
      `${prefix}-${this.tagNameSuffix}`,
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
    MVUI_GLOBALS.APP_DEBUG && this.flash('green');

    (this.shadowRoot || this).innerHTML = '';

    if (this._template === undefined) this._template = this.render();
    for (let el of this._template) {
      (this.shadowRoot || this).appendChild(this._renderTemplate(el));
    }

    if ((this.constructor as any).styles)
      style.util.applyStaticSheet((this.constructor as any).styles, this);

    if (this[STYLE_OVERRIDES])
      style.util.applySheetAsStyleTag(
        this, this[STYLE_OVERRIDES], 'mvui-instance-styles-overrides'
      );

    for (let ref of this.templateRefs) ref.resolve(ref.query());

    this.attrReflectionObserver.observe(this, { attributes: true });

    for (let attrName of this.getAttributeNames())
      this._maybeReflectToProp(attrName);

    for (let prop in this.props) {
      this.subscribe(this.props[prop], value => {
        // for better compatibility with other frameworks, we emit a change event
        // everytime we change a prop
        this.dispatchEvent(new CustomEvent('change')); // TODO: use normal Event

        this._maybeReflectToAttribute(prop, value);
      });
    }

    this.subscribe(this.styles, styles =>
      style.util.applySheetAsStyleTag(this, styles, 'mvui-instance-styles')
    );

    this.lifecycleState = "rendered"; this.onRender();
  }

  private disconnectedCallback() {
    this.lifecycleState = "removed"; this.onRemoved();
    this.attrReflectionObserver.disconnect();
    MVUI_GLOBALS.APP_DEBUG && this.flash('red');
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

  // TODO: maybe remove now that `define` is a thing?
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
   *   props = { value: new rx.Prop(0) };
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
      T['props'][key] extends State<infer I> ? I : never }
  > {
    const original = this; // reference to original constructor

    // new constructor behaviour
    const f: any = function(this: any, ...args: any[]) {
      const instance: any = original.apply(this, args)

      for (let p in instance.props) {
        Object.defineProperty(instance, p, {
          get() { return instance.props[p].value; },
          set(v: any) {
            instance.props[p].next(v);
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

  private unsubscribers: (() => void)[] = [];
  protected subscribe<T>(obs: Stream<T>, observer: ((value: T) => void)) {
    this.unsubscribers.push(obs.subscribe(
      !MVUI_GLOBALS.APP_DEBUG ? observer : v => { this.flash(); return observer(v) }
    ));
  }

  // ----------------------------------------------------------------------
  // debugging
  // ----------------------------------------------------------------------

  private flash = throttle((color = "blue") => {
    const prevOutline = this.style.outline;
    this.style.outline = `1px solid ${color}`;
    setTimeout(
      () => {
        this.style.outline = prevOutline;
        if (this.getAttribute('style') === '') this.removeAttribute('style');
      },
      400
    );
  }, 500);

  // ----------------------------------------------------------------------
  // events
  // ----------------------------------------------------------------------

  /**
   * Dispatch an event specified in the generic CustomEventsT parameter. All events will
   * be dispatched as an instance of `CustomEvent` with `detail` set to `value`.
   */
  protected dispatch<T extends keyof CustomEventsT>(
    name: T, value: CustomEventsT[T],
    options: EventInit = { bubbles: false }
  ) {
    if (typeof name !== 'string') return;
    this.dispatchEvent(new CustomEvent(name, { detail: value, ...options }));
  }

  // ----------------------------------------------------------------------
  // rendering
  // ----------------------------------------------------------------------

  private _template?: TemplateElement<any, any, any, any>[];;
  private _renderTemplate<T extends HTMLElement>(el: TemplateElement<T>) {
    const thisEl = el.creator();

    // --- setup attributes, events, props, class fields
    if (el.params) {
      if (el.params.attrs) {
        for (let attr in el.params.attrs) {
          const attrVal = (el as any).params.attrs[attr]
          // the camelToDash transformations here are actually not an mvui specific
          // assumption: html attributes are forced to be all lowercase by the browser
          if (attrVal instanceof Stream) {
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
        let events$: Stream<Event> | undefined;

        for (let prop in el.params.fields) {
          const val = el.params.fields[prop];
          if (val instanceof Stream) {
            let ignoreNextDown = false;

            // dataflow: upwards
            if (val instanceof State && BIND_MARKER in val) {
              if (!events$) events$ = fromAllEvents(thisEl);
              // console.debug('found bind marker');
              this.subscribe(events$.pipe(
                map(_ => thisEl[prop]),
                distinctUntilChanged(),
              ), v => {
                // console.debug(`prop changed detected: ${v}`, thisEl);
                ignoreNextDown = true;
                val.next(v);
              });
            }

            // dataflow: downwards
            this.subscribe(val, (v) => {
              if (val instanceof State && BIND_MARKER in val) {
                // console.debug(`state change detected: ${v}`, thisEl);
                if (ignoreNextDown) { ignoreNextDown = false; return; }
                // console.debug(`state change acted on: ${v}`, thisEl);
              }
              (thisEl as any)[prop] = v
            });

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
          if (val instanceof Stream) {
            let ignoreNextDown = false;

            // dataflow: upwards
            if (val instanceof State && BIND_MARKER in val) {
              const p: Prop<any> = (thisEl.props as any)[prop];
              this.subscribe(p.pipe(skip(1)), v => {
                // console.debug(`setting binding ${v}`);
                if (ignoreNextDown) { ignoreNextDown = false; return; }
                else { ignoreNextDown = true; }
                // console.debug(`${ignoreNext}: setting binding ${v}`);
                val.next(v);
              });
            }

            // dataflow: downwards
            this.subscribe(val, (v) => {
              // console.debug(`considering prop ${v}`);
              if (val instanceof State && BIND_MARKER in val) {
                if (ignoreNextDown) { ignoreNextDown = false; return; }
                else { ignoreNextDown = true; }
              }
              // console.debug(`setting prop ${v}`);
              thisEl.props[prop].next(v);
            });

          } else {
            thisEl.props[prop].next(val);
          }
        }
      }

      if (el.params.style) {
        for (let key in el.params.style) {
          const val = el.params.style[key]!;
          if (val instanceof Stream) {
            this.subscribe(val, v => {
              thisEl.style[key] = v.toString();
            });
          } else {
            thisEl.style[key] = val.toString();
          }
        }
      }
      if (el.params.styleOverrides) {
        // console.log('style overrides')
        if (!(thisEl instanceof Component)) throw new Error(
          'Style overrides may only be used for mvui components'
        );
        if (thisEl.shadowRoot === null) throw new Error(
          'Style overrides may only be used for components with a shadow dom'
        );
        thisEl[STYLE_OVERRIDES] = el.params.styleOverrides;
      }
    }

    // --- recurse
    if (el.children) {
      if (typeof el.children === 'string') {
        thisEl.innerText = el.children;
      } else if (el.children instanceof Stream) {
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
          thisEl.append(
            child instanceof TemplateElement ? this._renderTemplate(child) : child
          );
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
    CompT['props'][key] extends State<infer I> ? I : never }
>;
