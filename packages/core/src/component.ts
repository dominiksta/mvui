import {
  TemplateElement,
  ParamSpec as _ParamSpec,
  TemplateElementChild, TemplateElementChildren
} from "./template-element";
import { Constructor, MaybeSubscribable, ToStringable } from "./util/types";
import {
  Stream, State, Prop, Context, fromAllEvents, fromEvent, map,
  distinctUntilChanged, skip, MulticastStream, throttleTime, debounceTime
} from "./rx";
import { camelToDash } from "./util/strings";
import { MVUI_GLOBALS } from "./globals";
import * as style from "./style";
import { isBinding } from "./rx/bind";
import { isSubscribable, Subscribable } from "./rx/subscribable";

// these symbols are used for properties that should be accessible from anywhere in mvui
// but should not be part of api surface
const STYLE_OVERRIDES = Symbol();
const PROVIDED_CONTEXTS = Symbol();

const GENERIC_TYPE_HIDE = Symbol();

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
 * @noInheritDoc
 */
export default abstract class Component<
  ParamSpec extends _ParamSpec = { },
> extends HTMLElement {

  protected abstract render(): TemplateElement<any, any, any>[];

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

    this.lifecycleState = "created";
  }

  static register() {
    if (!this.tagNameSuffix)
      this.tagNameSuffix = camelToDash(this.name).substring(1);

    // fix bundled names starting with `_`
    if (this.tagNameSuffix.startsWith("-"))
      this.tagNameSuffix = this.tagNameSuffix.substring(1);

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

  private _lifecycleHooks: {
    render: (() => any)[], removed: (() => any)[],
  } = {
    render: [], removed: []
  }

  /**
   * Run a given function when the component is done rendering. A render happens each time
     the component is added to the DOM.
   */
  protected onRendered(callback: () => any) {
    this._lifecycleHooks.render.push(callback);
  }

  /** Run a given function when the component is removed from the DOM. */
  protected onRemoved(callback: () => any) {
    this._lifecycleHooks.removed.push(callback);
  }

  private connectedCallback() {
    MVUI_GLOBALS.APP_DEBUG && this.flash.next('green');

    (this.shadowRoot || this).innerHTML = '';

    this._lifecycleHooks = { removed: [], render: [] };
    this._template = this.render();
    this.lifecycleState = "added";
    for (let el of this._template) {
      (this.shadowRoot || this).appendChild(this._renderTemplate(el));
    }

    if ((this.constructor as any).styles)
      style.util.applyStaticSheet((this.constructor as any).styles, this);

    if (this[STYLE_OVERRIDES])
      style.util.applySheetAsStyleTag(
        this, this[STYLE_OVERRIDES], 'mvui-instance-styles-overrides'
      );

    for (let ref of this.queryRefs) ref.resolve(ref.query());

    this.attrReflectionObserver.observe(this, { attributes: true });

    for (let attrName of this.getAttributeNames())
      this._maybeReflectToProp(attrName);

    for (let prop in this.props) {
      this._subscribe(this.props[prop], value => {
        // for better compatibility with other frameworks, we emit a change event
        // everytime we change a prop
        this.dispatchEvent(new CustomEvent('change')); // TODO: use normal Event

        this._maybeReflectToAttribute(prop, value);
      });
    }

    this._subscribe(this.styles, styles =>
      style.util.applySheetAsStyleTag(this, styles, 'mvui-instance-styles')
    );
    this.setupFlash();

    this.lifecycleState = "rendered"; this._lifecycleHooks.render.forEach(f => f());
  }

  private disconnectedCallback() {
    this.lifecycleState = "removed"; this._lifecycleHooks.removed.forEach(f => f());
    this.attrReflectionObserver.disconnect();
    MVUI_GLOBALS.APP_DEBUG && this.flash.next('red');
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
  [GENERIC_TYPE_HIDE]?: ParamSpec;

  // TODO: maybe remove now that `define` is a thing?
  /** Get a new {@link TemplateElement} for use in a {@link render} method. */
  static new<
    T extends Component<E>,
    E extends _ParamSpec = T extends Component<infer I> ? I : never
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

  private _subscribe<T>(obs: Stream<T>, observer: ((value: T) => void)) {
    this.onRemoved(obs.subscribe(v => {
      if (MVUI_GLOBALS.APP_DEBUG) this.flash.next();
      return observer(v)
    }));
  }

  // ----------------------------------------------------------------------
  // debugging
  // ----------------------------------------------------------------------

  private flash = new MulticastStream<string | void>();
  private setupFlash() {
    let prevOutline = this.style.outline;
    let isFlashing = false;
    this.onRemoved(this.flash.pipe(throttleTime(100)).subscribe(color => {
      if (!color) color = 'blue';
      if (!isFlashing) {
        prevOutline = this.style.outline;
        isFlashing = true;
      }
      this.style.outline = `1px solid ${color}`;
    }));
    this.onRemoved(this.flash.pipe(debounceTime(400)).subscribe(_ => {
      this.style.outline = prevOutline;
      isFlashing = false;
    }));
  }

  // ----------------------------------------------------------------------
  // events
  // ----------------------------------------------------------------------

  /**
   * Dispatch an event specified in the generic CustomEventsT parameter. All events will
   * be dispatched as an instance of `CustomEvent` with `detail` set to `value`.
   *
   * All events will by default stop not bubble any further then the parent of this
   * component.
   */
  protected dispatch<
    T extends keyof ParamSpec['events'],
    V extends (ParamSpec['events'][T] extends CustomEvent<infer I> ? I : never)
  >(
    name: T, value: V,
    options: EventInit = { bubbles: false }
  ) {
    if (typeof name !== 'string') return;
    this.dispatchEvent(new CustomEvent(name, { detail: value, ...options }));
  }

  /**
   * Dispatch an event specified in the generic CustomEventsT parameter. In contrast to
   * {@link dispatch}, this method takes an existing event and redispatches it in with
   * only the type set to `name`. Use this if you want to redispatch existing events like
   * a MouseEvent.
   *
   * All events will by default stop not bubble any further then the parent of this
   * component.
   */
  protected reDispatch<
    T extends keyof ParamSpec['events'],
    V extends (
      ParamSpec['events'][T] extends Event ? ParamSpec['events'][T] : never
    )
  >(
    name: T, value: V,
    noBubble = true,
  ) {
    if (typeof name !== 'string') return;
    const _value: any = value;
    if (_value instanceof Event) {
      this.dispatchEvent(new (_value as any).constructor(name, {
        ...value,
        target: this,
        bubbles: !noBubble
      }));
      if (noBubble) value.stopPropagation();
    } else {
      throw new Error('Only Event objects may be reDispatched');
    }
  }

  // ----------------------------------------------------------------------
  // context
  // ----------------------------------------------------------------------

  [PROVIDED_CONTEXTS] = new Map<Context<any>, any>();

  /**
     Provide a given context in this component. See {@link Context} for details and an
     example.
   */
  protected provideContext<T>(ctx: Context<T>): T {
    if (this[PROVIDED_CONTEXTS].has(ctx))
      throw new Error(
        'The same context is alreday provided by this component',
      );
    const state = ctx.generateInitialValue();
    this[PROVIDED_CONTEXTS].set(ctx, state);
    return state;
  }

  /** @ignore */
  protected getContext<T>(ctx: Context<T>, force: false): T | null;
  /** @ignore */
  protected getContext<T>(ctx: Context<T>, force?: true): T;
  /** Get a given context. See {@link Context} for details and an example. */
  protected getContext<T>(ctx: Context<T>, force?: boolean): T | null {
    let parent = this.parentElement;
    while (true) {
      if (parent instanceof Component) {
        if (parent[PROVIDED_CONTEXTS].has(ctx))
          return parent[PROVIDED_CONTEXTS].get(ctx);
        parent = parent.parentElement;
      } else if (parent instanceof HTMLElement) {
        parent = parent.parentElement;
      } else {
        if (force) throw new Error('Could not find Context');
        else return null;
      }
    }
  }

  // ----------------------------------------------------------------------
  // rendering
  // ----------------------------------------------------------------------

  private _template?: TemplateElement<any, any, any>[];;
  private _renderTemplate<T extends HTMLElement>(el: TemplateElement<T>) {
    const thisEl = el.creator();

    // --- setup attributes, events, props, class fields
    if (el.params) {

      let events$: Stream<Event> | undefined;

      const bindAttrOrField = <T>(
        bind: State<T>,
        getter: () => T,
        setter: (value: T) => void,
      ) => {
        let ignoreNextDown = false;

        // dataflow: upwards
        if (!events$) events$ = fromAllEvents(thisEl);
        this._subscribe(events$.pipe(
          map(_ => getter()),
          distinctUntilChanged(),
        ), v => {
          // console.debug(`prop changed detected: ${v}`, thisEl);
          ignoreNextDown = true;
          bind.next(v);
        });

        // dataflow: downwards
        this._subscribe(bind, (v) => {
          if (ignoreNextDown) { ignoreNextDown = false; return; }
          setter(v);
        });
      }

      const maybeBindAttrOrField = <T>(
        value: MaybeSubscribable<T>,
        getter: () => T,
        setter: (value: T) => void,
      ) => {
        let bind: State<any> | undefined;
        if (bind = isBinding(value)) {
          bindAttrOrField(bind, getter, setter);
        } else if (isSubscribable(value)) {
          this.subscribe(value, (v) => setter(v));
        } else { setter(value); }
      }

      if (el.params.fields) {
        for (let prop in el.params.fields) {
          maybeBindAttrOrField(
            el.params.fields[prop],
            () => thisEl[prop],
            (v) => { (thisEl as any)[prop] = v }
          )
        }
      }

      if (el.params.attrs) {
        for (let attr in el.params.attrs) {
          maybeBindAttrOrField(
            (el as any).params.attrs[attr],
            // the camelToDash transformations here are actually not an mvui specific
            // assumption: html attributes are forced to be all lowercase by the browser
            () => thisEl.getAttribute(attr),
            (v) => thisEl.setAttribute(camelToDash(attr), v),
          );
        }
      }

      if (el.params.events) {
        for (let key in el.params.events) {
          this.onRemoved(fromEvent(thisEl, key as any).subscribe(
            (el.params.events as any)[key])
          );
        }
      }

      if (el.params.props) {
        if (!(thisEl instanceof Component)) throw new Error(
          'Attempted to set props on a template element that is not an mvui ' +
          'component'
        );
        for (let prop in el.params.props) {
          const val = (el.params.props as any)[prop];

          let bind: State<any> | undefined;
          if (bind = isBinding(val)) {
            let ignoreNextDown = false;
            const p: Prop<any> = (thisEl.props as any)[prop];
            // dataflow: upwards
            this._subscribe(p.pipe(skip(1)), v => {
              // console.debug(`setting binding ${v}`);
              if (ignoreNextDown) { ignoreNextDown = false; return; }
              else { ignoreNextDown = true; }
              // console.debug(`${ignoreNext}: setting binding ${v}`);
              bind!.next(v);
            });

            // dataflow: downwards
            this._subscribe(bind, (v) => {
              if (ignoreNextDown) { ignoreNextDown = false; return; }
              else { ignoreNextDown = true; }
              thisEl.props[prop].next(v);
            });
          } else if (isSubscribable(val)) {
            this.subscribe(val, (v) => thisEl.props[prop].next(v));
          } else {
            thisEl.props[prop].next(val);
          }
        }
      }

      if (el.params.ref) {
        const value = el.params.ref;
        if (!('id' in value)) throw new Error('Invalid template reference object');
        this.templateRefs.find(
          el => el.id === (value as any).id
        )!.current = thisEl;
      }

      if (el.params.style) {
        for (let key in el.params.style) {
          const val = el.params.style[key]!;
          if (isSubscribable<ToStringable>(val)) {
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

      const classes = el.params.classes;
      if (classes) {
        for (let key in classes) {
          const val = classes[key]!;
          if (isSubscribable(val)) {
            this.subscribe(val, v => {
              thisEl.classList.toggle(key, v);
            });
          } else {
            thisEl.classList.toggle(key, val);
          }
        }
      }
    }

    const recurse = (children: TemplateElementChildren, slot = 'default') => {
      const clear = () => {
        if (slot === 'default') {
          if (children instanceof Array && children.length === 0) return;
          thisEl.innerText = '';
          thisEl.innerHTML = '';
        }
        else {
          Array.from(thisEl.children).filter(el => el.slot === slot)
            .forEach(el => thisEl.removeChild(el));
        }
      };

      const createWrapper = () => {
        const wrapper = document.createElement('span');
        wrapper.slot = slot;
        thisEl.appendChild(wrapper);
        return wrapper;
      }

      // case (1): ['hi', h.div(), 'hi'] => wrapper
      // case (2): ['hi', 'hi']          => wrapper
      // case (3): 'hi'                  => wrapper
      // case (4): [h.div(), h.div()]    => no wrapper
      // case (5): h.div()               => no wrapper

      // case (3, 5)
      const addSingleChild = (
        t: TemplateElementChild,
        slot: string, addTo: HTMLElement = thisEl
      ) => {
        if (t === undefined) return;
        if (t instanceof TemplateElement) { // case (5)
          const rendered = this._renderTemplate(t);
          if (slot !== 'default') rendered.slot = slot;
          addTo.appendChild(rendered);
        } else if (t instanceof HTMLElement) { // case (3)
          addTo.append(t);
        } else {
          addTo.append(t.toString());
        }
      }

      // case (1, 2, 4)
      const addMultipleChildren = (
        t: TemplateElementChild[],
        slot: string
      ) => {
        const includesString = t.map(
          child => typeof child === 'string'
        ).includes(true);
        if (slot !== 'default' && includesString) {
          const wrapper = createWrapper();
          for (let child of t) addSingleChild(child, 'default', wrapper);
        } else {
          for (let child of t) addSingleChild(child, slot, thisEl);
        }
      }

      const addChildren = (
        t: TemplateElementChild | TemplateElementChild[],
        slot: string
      ) => {
        clear();
        if (t === undefined) return;
        else if ((
          typeof t === 'string' || typeof t === 'number'
        ) && slot === 'default') thisEl.innerText = t.toString();
        else if (t instanceof Array) addMultipleChildren(t, slot); // case (1, 2, 4)
        else {
          const addTo = (
            slot === 'default' || t instanceof TemplateElement
          ) ? thisEl : createWrapper();
          addSingleChild(t, slot, addTo); // case (3, 5)
        }
      }

      if (children instanceof Stream)
        this._subscribe(children, v => addChildren(v, slot));
      else
        addChildren(children, slot);
    }

    if (el.children) recurse(el.children);
    if (el.params && el.params.slots) {
      const slots = el.params.slots;
      for (let slot in slots) recurse((slots as any)[slot], slot);
    }

    return thisEl;
  }

  // ----------------------------------------------------------------------
  // template references
  // ----------------------------------------------------------------------

  private templateRefs: {
    id: Symbol,
    current?: HTMLElement,
  }[] = [];
  // private TEMPLATE_REF_MARKER = Symbol();

  /**
     Get a reference to an element in the template as a promise that will be resolved on
     render.

     @example
     ```typescript
     class TemplateReferences extends Component {

       render() {
         const myRef = this.ref<HTMLElement>();

         this.onRendered(async () => {
           myRef.current.innerText = 'itsame 2';
         });

         return [ h.div({ ref: myRef }, 'itsame') ]
       }
     }
     ```
   */
  ref<T extends HTMLElement = any>(): { current: T } {
    const ret = {
      id: Symbol(),
    };
    Object.defineProperty(ret, 'current', {
      get: () => {
        const found = this.templateRefs.find(el => el.id === ret.id);
        if (!found?.current)
          throw new Error(
            'Template reference currently does not resolve to anything.' +
            ' Try only dereferencing when the component is rendered.'
          )
        else return found?.current;
      },
      // configurable: true,
    })
    this.templateRefs.push({ id: ret.id, current: undefined });
    return ret as any;
  }

  // ----------------------------------------------------------------------
  // queries
  // ----------------------------------------------------------------------

  private queryRefs: {
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
      this.queryRefs.push({ resolve, query: queryFun });
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
      this.queryRefs.push({ resolve, query: queryFun });
    });
  }


}

/** Helper type to infer the custom events of a Component */
export type ComponentTemplateElement<
  CompT extends Component<any>,
> = TemplateElement<
  CompT,
  CompT extends Component<infer I> ? I : never,
  { [key in keyof CompT['props']]:
    CompT['props'][key] extends State<infer I> ? I : never }
>;
