import {
  TemplateElement,
  ParamSpec as _ParamSpec,
  TemplateElementChild, TemplateElementChildren, ComponentTemplate, TEMPLATE_TRACKED
} from "./template-element";
import { Constructor, MaybeSubscribable, ToStringable } from "./util/types";
import {
  Stream, State, Context, fromAllEvents, fromEvent, map,
  distinctUntilChanged, skip, MulticastStream, throttleTime, debounceTime,
} from "./rx";
import { camelToDash } from "./util/strings";
import { MVUI_GLOBALS } from "./globals";
import * as style from "./style";
import { isBinding } from "./rx/bind";
import { isSubscribable, Subscribable } from "./rx/interface";
import { Prop } from "./rx/prop";
import { customElementConnected, getParentNode, getActiveElement } from "./util/dom";
import { Fragment } from "./fragment";

// these symbols are used for properties that should be accessible from anywhere in mvui
// but should not be part of api surface
const STYLE_OVERRIDES = Symbol();
const PROVIDED_CONTEXTS = Symbol();

const GENERIC_TYPE_HIDE = Symbol();

// we need to make sure that customElements is patched *before* we register any (mvui)
// component
customElementConnected().subscribe();

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

  protected abstract render(): ComponentTemplate;

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

  constructor() {
    super();

    if ((this.constructor as any).useShadow && !this.shadowRoot) {
      this.attachShadow({mode: 'open'});
    }
  }

  static getTagName(constructor?: Function): string {
    const cls = constructor ? (constructor as typeof Component) : this;

    if (!cls.tagNameSuffix)
      cls.tagNameSuffix = camelToDash(cls.name).substring(1);

    // fix bundled names starting with `_`
    if (cls.tagNameSuffix.startsWith("-"))
      cls.tagNameSuffix = cls.tagNameSuffix.substring(1);

    let prefix;
    if (cls.tagNameLibrary) {
      prefix = MVUI_GLOBALS.PREFIXES.get(cls.tagNameLibrary) ??
        cls.tagNameLibrary;
    } else {
      prefix = MVUI_GLOBALS.PREFIXES.get('default');
    }
    return `${prefix}-${this.tagNameSuffix}`;
  }

  static get tagName() { return this.getTagName(); }

  static register(constructor?: Function) {
    const cls = constructor ? (constructor as typeof Component) : this;
    customElements.define(cls.getTagName(), cls as any);
  }

  // ----------------------------------------------------------------------
  // lifecycle
  // ----------------------------------------------------------------------

  private _lifecycleHooks: {
    render: (() => any)[], removed: (() => any)[], added: (() => any)[],
  } = {
    render: [], removed: [], added: [],
  }

  private _lifecycleHasRendered = false;
  private _lifecycleIsMounted = false;


  /**
   * Run a given function everytime the component is added to the DOM. Runs after
   * rendering is done.
   */
  onAdded(callback: () => any) {
    this._lifecycleHooks.added.push(callback);
  }

  /**
   * Run a given function when the component is done rendering. Renders only happen once
   * when the component is added to the DOM for the first time.
   */
  onRendered(callback: () => any) {
    this._lifecycleHooks.render.push(callback);
  }

  /** Run a given function when the component is removed from the DOM. */
  onRemoved(callback: () => any) {
    this._lifecycleHooks.removed.push(callback);
  }

  /**
     Remove an existing lifecycle hook. See {@link onAdded}, {@link onRendered} and {@link
     onRemoved}.
   */
  removeLifecycleHook(kind: 'added' | 'render' | 'removed', callback: () => any) {
    const hooks = this._lifecycleHooks[kind];
    const idx = hooks.findIndex(callback);
    if (idx === -1)
      throw new Error('provided callback was not registered as lifecycle hook');
    this._lifecycleHooks[kind].splice(idx, 1);
  }

  private connectedCallback() {
    MVUI_GLOBALS.APP_DEBUG && this.flash.next('green');
    this._lifecycleIsMounted = true;

    this.attrReflectionObserver.observe(this, { attributes: true });

    for (let attrName of this.getAttributeNames())
      this._maybeReflectToProp(attrName);

    try {
      if (!this._lifecycleHasRendered) {
        (this.shadowRoot || this).innerHTML = '';
        this._template = this.render();
        this._lifecycleHooks.added.forEach(f => f());
        this._renderComponentTemplate(this._template);
        if ((this.constructor as any).styles) style.util.applySheet(
          (this.constructor as any).styles, this, 'component_static'
        );
        this._lifecycleHasRendered = true;
        this._lifecycleHooks.render.forEach(f => f());
      } else {
        this._lifecycleHooks.added.forEach(f => f());
      }
    } catch(e) {
      console.warn(`Mvui: Error while rendering ${this.tagName}`);
      throw e;
    }

    for (let ref of this.queryRefs) ref.resolve(ref.query());

    if (this[STYLE_OVERRIDES])
      style.util.applySheet(
        this[STYLE_OVERRIDES], this, 'component_instance_overrides'
      );
  }

  private disconnectedCallback() {
    this._lifecycleIsMounted = false;
    this._lifecycleHooks.removed.forEach(f => f());
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

  /** Get a new {@link TemplateElement} for use in a {@link render} method. */
  static t<
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
   *   props = { value: rx.prop<number>() };
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

  /**
     Subscribe to a given stream/subscribable and automatically unsubscribe on
     unmount. Also flash the outline of the component when {@link MVUI_GLOBALS}.APP_DEBUG
     is set and a new value is emitted.  Returns the original subscribable unmodified for
     convenience.
   */
  protected subscribe<T extends Subscribable<any>>(
    subscribable: T,
    observer?: ((value: T extends Subscribable<infer I> ? I : never) => void)
  ): T {
    let unsub: () => void;
    const sub = () => {
      unsub = subscribable.subscribe(v => {
        if (MVUI_GLOBALS.APP_DEBUG) this.flash.next();
        if (observer) observer(v);
      });
    };

    if (this._lifecycleIsMounted) sub();
    this.onAdded(sub);

    this.onRemoved(() => {
      console.assert(unsub !== undefined);
      unsub();
    });
    return subscribable;
  }

  // ----------------------------------------------------------------------
  // debugging
  // ----------------------------------------------------------------------

  private flash = new MulticastStream<string | void>();
  private setupFlash() {
    let prevOutline = this.style.outline;
    let isFlashing = false;
    this.subscribe(this.flash.pipe(throttleTime(100)), color => {
      if (!color) color = 'blue';
      if (!isFlashing) {
        prevOutline = this.style.outline;
        isFlashing = true;
      }
      this.style.outline = `1px solid ${color}`;
    });
    this.subscribe(this.flash.pipe(debounceTime(400)), _ => {
      this.style.outline = prevOutline;
      isFlashing = false;
    });
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
     Provide a given context in this component. See {@link rx.Context} for details and an
     example.
   */
  protected provideContext<T>(ctx: Context<T>, value?: T): T {
    if (this[PROVIDED_CONTEXTS].has(ctx))
      throw new Error(
        'The same context is alreday provided by this component',
      );
    if (value === undefined) {
      if (ctx.generateInitialValue) value = ctx.generateInitialValue();
      else throw new Error(
        'Context has no generator function, value must be provided'
      );
    }
    this[PROVIDED_CONTEXTS].set(ctx, value);
    return value;
  }

  protected getContext<T>(ctx: Context<T>, force: false): T | null;
  protected getContext<T>(ctx: Context<T>, force?: true): T;
  /** Get a given context. See {@link rx.Context} for details and an example. */
  protected getContext<T>(ctx: Context<T>, force?: boolean): T | null {
    let currNode: Node | null = this;
    while (true) {
      if (currNode instanceof Component) {
        if (currNode[PROVIDED_CONTEXTS].has(ctx))
          return currNode[PROVIDED_CONTEXTS].get(ctx);
        currNode = getParentNode(currNode);
      } else if (currNode instanceof HTMLElement) {
        currNode = getParentNode(currNode);
      } else {
        if (force) throw new Error('Could not find Context');
        if (!ctx.generateInitialValue)
          throw new Error('No default value for context given')
        else return ctx.generateInitialValue();
      }
    }
  }

  // ----------------------------------------------------------------------
  // rendering
  // ----------------------------------------------------------------------

  private _template?: ComponentTemplate;
  private keyedElements = new Map<string, HTMLElement>();

  private _renderComponentTemplate(template: ComponentTemplate) {
    this.keyedElements.clear();

    this.setupFlash();

    for (let prop in this.props) {
      this.subscribe(this.props[prop], value => {
        this._maybeReflectToAttribute(prop, value);
      });
    }

    this.subscribe(this.styles, styles =>
      style.util.applySheet(styles, this, 'component_instance')
    );

    const addTo = (this.shadowRoot || this);
    for (const el of template) {
      if (el instanceof TemplateElement)
        addTo.append(this._renderTemplateElement(el));
      else if (el instanceof Fragment)
        this._renderFragment(addTo, el);
      else throw new Error('Invalid Component Template Element');
    }
  }

  private _renderTemplateElement<T extends HTMLElement>(
    el: TemplateElement<T>
  ): T {
    const hasKey = (el as any)[TEMPLATE_TRACKED];
    if (hasKey) {
      const got = this.keyedElements.get(hasKey);
      if (got) {
        // console.debug(`got element for key ${hasKey}`);
        return got as T;
      }
    }

    const thisEl = el.creator();
    if (hasKey) {
      // console.debug(`creating el for key ${hasKey}`);
      this.keyedElements.set(hasKey, thisEl);
    }

    // --- setup attributes, events, props, class fields
    if (el.params) {

      let events: Stream<Event> | undefined;

      const bindAttrOrField = <T>(
        bind: State<T>,
        getter: () => T,
        setter: (value: T) => void,
      ) => {
        let ignoreNextDown = false;

        // dataflow: upwards
        if (!events) events = fromAllEvents(thisEl);
        this.subscribe(events.pipe(
          map(_ => getter()),
          distinctUntilChanged(),
        ), v => {
          // console.debug(`prop changed detected: ${v}`, thisEl);
          ignoreNextDown = true;
          bind.next(funcToHigherOrder(v));
        });

        // dataflow: downwards
        this.subscribe(bind, (v) => {
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
            (v) => (thisEl as any)[prop] = v
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
            (v) => v === undefined
              ? thisEl.removeAttribute(camelToDash(attr))
              : thisEl.setAttribute(camelToDash(attr), v),
          );
        }
      }

      if (el.params.events) {
        for (let key in el.params.events) {
          this.subscribe(
            fromEvent(thisEl, key as any), (el.params.events as any)[key]
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
            this.subscribe(p.pipe(skip(1)), v => {
              // console.debug(`setting binding ${v}`);
              if (ignoreNextDown) { ignoreNextDown = false; return; }
              else { ignoreNextDown = true; }
              // console.debug(`${ignoreNext}: setting binding ${v}`);
              bind!.next(funcToHigherOrder(v));
            });

            // dataflow: downwards
            this.subscribe(bind, (v) => {
              if (ignoreNextDown) { ignoreNextDown = false; return; }
              else { ignoreNextDown = true; }
              thisEl.props[prop].next(funcToHigherOrder(v));
            });
          } else if (isSubscribable(val)) {
            this.subscribe(val, (v) => thisEl.props[prop].next(funcToHigherOrder(v)));
          } else {
            thisEl.props[prop].next(funcToHigherOrder(val));
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
              if (v === undefined) return;
              thisEl.style[key] = v.toString();
            });
          } else {
            if (val !== undefined) thisEl.style[key] = val.toString();
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
        } else {
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
        slot: string, addTo: HTMLElement,
      ) => {
        if (t === undefined) return;
        if (t instanceof TemplateElement) { // case (5)
          const rendered = this._renderTemplateElement(t);
          if (slot !== 'default') rendered.slot = slot;
          addTo.append(rendered);
        } else if (t instanceof Node) { // case (3)
          addTo.append(t);
        } else if (t instanceof Fragment) {
          this._renderFragment(addTo, t);
        } else {
          addTo.append(t.toString());
        }
      }

      // case (1, 2, 4)
      const addMultipleChildren = (
        t: TemplateElementChild[],
        slot: string
      ) => {
        const includesString =
          t.map(child => typeof child === 'string').includes(true);
        const keyed = t.map(child =>
          child instanceof TemplateElement && TEMPLATE_TRACKED in child
        );

        if (!keyed.includes(true)) {

          clear();
          const addTo = (slot !== 'default' && includesString)
            ? createWrapper() : thisEl;
          for (const child of t) addSingleChild(child, slot, addTo);

        } else {

          if (keyed.includes(false)) throw new Error(
            'Either all or no child elements must have the `key` template attribute'
          );
          const rendered = t.map(child => {
            const el = child as TemplateElement<any>;
            return {
              key: (el as any)[TEMPLATE_TRACKED] as string,
              rendered: this._renderTemplateElement(el) as HTMLElement
            };
          })
          const keys = t.map(child => (child as any)[TEMPLATE_TRACKED] as string);
          const prevEls = Array.from(thisEl.children);
          const prevKeys = prevEls.map(v => v.getAttribute('mvui-key')!);

          for (let child of rendered)
            child.rendered.setAttribute('mvui-key', child.key);

          // remove deleted
          for (let i = 0; i < prevKeys.length; i++) {
            if (!keys.includes(prevKeys[i])) {
              prevEls[i].remove();
              this.keyedElements.delete(prevKeys[i]);
              // console.debug(`removing el with key=${prevKeys[i]}`);
            }
          }

          const isSameOrder = (() => {
            if (prevKeys.length === 0) return false;
            let prevPos = -1;
            for (let i = 0; i < keys.length; i++) {
              const newPrevPos = prevKeys.findIndex(k => k === keys[i]);
              // console.debug({ newPrevPos, 'keys[i]': keys[i], prevKeys });
              if (newPrevPos !== -1 && newPrevPos <= prevPos) return false;
              prevPos = newPrevPos;
            }
            return true;
          })();
          // console.debug({ isSameOrder });

          const prevFocus = getActiveElement(this.shadowRoot || document);

          if (isSameOrder) { // add only new
            let prevPos = 0;
            let pastStart = false;
            let pastEnd = false;
            for (let i = 0; i < rendered.length; i++) {
              const idx = prevKeys.findIndex(k => k === rendered[i].key);

              if (idx !== -1) { // prev element found
                prevPos = idx;
                pastStart = true;
                if (prevPos === prevEls.length - 1) pastEnd = true;
                continue;
              }

              if (!pastStart) {
                thisEl.prepend(rendered[i].rendered);
              } else {
                if (!pastEnd) {
                  prevEls[prevPos].after(rendered[i].rendered);
                } else {
                  thisEl.append(rendered[i].rendered);
                }
              }
            }

          } else { // reorder all
            for (let child of rendered) {
              // console.debug(`adding el with key=${child.key}`);
              thisEl.appendChild(child.rendered);
            }
          }

          if (prevFocus instanceof HTMLElement) prevFocus.focus();
        }
      };

      const addChildren = (
        t: TemplateElementChild | TemplateElementChild[],
        slot: string
      ) => {
        if (t instanceof Array) {
          addMultipleChildren(t, slot); // case (1, 2, 4)
        } else {
          clear();
          if (t === undefined) return;
          else if ((
            typeof t === 'string' || typeof t === 'number'
          ) && slot === 'default') thisEl.innerText = t.toString();
          else {
            const addTo = (
              slot === 'default' || t instanceof TemplateElement
            ) ? thisEl : createWrapper();
            addSingleChild(t, slot, addTo); // case (3, 5)
          }
        }
      };

      if (children instanceof Stream)
        this.subscribe(children, v => addChildren(v, slot));
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

  private _renderFragment(parent: Node, f: Fragment<any>) {
    this.subscribe(f.stream, value => {
      const template = f.template(value);
      const previousThis =
        Array.from(parent.childNodes).filter(
          el => Fragment.MARKER in el &&
            (el as any)[Fragment.MARKER] === f.id,
        );

      let add: (node: Node) => void;
      if (previousThis.length !== 0) {
        const sibl = previousThis[0].previousSibling
        if (sibl) {
          add = sibl.after.bind(sibl);
        } else {
          add = (node) => parent.insertBefore(node, parent.firstChild);
        }
      } else {
        add = parent.appendChild.bind(parent);
      }

      for (const prev of previousThis) parent.removeChild(prev);

      for (const child of template) {
        const rendered = this._renderTemplateElement(child);
        (rendered as any)[Fragment.MARKER] = f.id;
        add(rendered);
        add = rendered.after.bind(rendered);
      }
    })
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
    if (this._lifecycleHasRendered) return queryFun();
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
    if (this._lifecycleHasRendered) return queryFun();
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
  CompT['props']
>;



/**
   When calling the `next` method on a `State` object or similar, a passed function will
   be interpreted as a transformer of the previous value.  In general, this makes sense
   but not in templates. Therefore, this function is equivalent to the identity function
   except that `func` will be transformed to `() => func`.
 */
const funcToHigherOrder = <T>(val: T): T | (() => T) =>
  typeof val === 'function' ? () => val : val;
