import { Observer } from "./stream";
import MulticastStream from "./multicast-stream";
import { derive, DerivedState } from "./derived-state";

/**
 * A {@link MulticastStream} that remembers the last emitted value. Useful to model state.
 *
 * @example
 * ```typescript
 * const state$ = new State(1);
 * state$.map(v => v + 1).subscribe(console.log);
 *
 * state$.next(4); state$.next(3);
 *
 * // Logs: 2 5 4
 *
 * // The difference to a normal Subject is that we provide an initial value
 * // and we could always access the current value with `.value`.
 * ```
 * @noInheritDoc
 */
export default class State<T> extends MulticastStream<T> {

  private _value: T;
  /** The current value/state */
  get value() { return this._value }

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    try {
      observer.next(this._value);
    } catch(e) {
      observer.error(e);
    }

    return super._subscribe(observer);
  }

  /** Set a new value and trigger all subscriptions with that new value */
  override next(valueOrSetter: T | ((currentValue: T) => T)) {
    if (this.completed) return;
    const newValue = valueOrSetter instanceof Function ?
      valueOrSetter(this._value) : valueOrSetter;
    this._value = newValue;
    super.next(newValue);
  }

  /** Shorthand for rx.{@link derive}(this, definition) */
  derive<ReturnT>(definition: (value: T) => ReturnT): DerivedState<ReturnT> {
    return derive(this, definition);
  }

  /**
     Create a linked "child" state object. In contrast to using {@link DerivedState}, this
     LinkedState is always derived from a single State object (this). This allows the
     definition of a setter.

     Although you can use this function manually (see below), you will most likely create
     LinkedState by using the {@link State#partial} helper:

     ### Partial State

     See {@link State#partial}.

     ```typescript
     const state = new rx.State({ its: { nested: 4 });
     const partial = state.partial('its', 'nested');
     partial.next(v => v + 1); // will also update state
     ```

     ### Manual Definition

     ```typescript
     const state = new rx.State(1);
     const linked = new state.createLinked(
       v => v + 1,
       v => v - 1,
     );

     state.subscribe(v => console.log(`state: ${v}`)); // logs: 1
     linked.subscribe(v => console.log(`linked: ${v}`)); // logs: 2

     linked.next(3);
     // logs: linked: 3\n state: 2
     ```
   */
  createLinked<ReturnT>(
    getter: (value: T) => ReturnT, setter: (value: ReturnT) => T
  ): LinkedState<T, ReturnT> {
    return new LinkedState(this, getter, setter);
  }

  // incoming huge type def

  /**
     Create a new state object representing a part of `this`'s state.

     ```typescript
     const state = new rx.State({ its: { nested: 4 });
     const partial = state.partial('its', 'nested');
     partial.next(v => v + 1); // will also update state
     ```
   */
  partial<
    K1 extends keyof T,
  >(k1: K1): LinkedState<T, T[K1]>;

  /** @ignore */
  partial<
    K1 extends keyof T, K2 extends keyof T[K1],
  >(k1: K1, k2: K2): LinkedState<T, T[K1][K2]>;

  /** @ignore */
  partial<
    K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
  >(k1: K1, k2: K2, k3: K3): LinkedState<T, T[K1][K2][K3]>;

  /** @ignore */
  partial<
    K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
  >(k1: K1, k2: K2, k3: K3, k4: K4): LinkedState<T, T[K1][K2][K3][K4]>;

  /** @ignore */
  partial<
    K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): LinkedState<T, T[K1][K2][K3][K4][K5]>;

  partial<
    K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6
  ): LinkedState<T, T[K1][K2][K3][K4][K5][K6]>;

  /** @ignore */
  partial<
    K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, ...rest: string[]
  ): LinkedState<T, unknown>;

  partial(...args: (string | number | symbol)[]): LinkedState<T, any> {
    return this.createLinked(
      val => {
        let current: any = val;
        for (const a of args) current = current[a];
        return current;
      },
      val => {
        let current: any = this.value;
        for (const a of args.slice(0, -1)) current = current[a];
        current[args[args.length - 1]] = val;
        return this.value;
      },
    )
  }
}


/** See {@link State#createLinked}. */
export class LinkedState<FromT, T> extends State<T> {

  private parentUnsubscriber?: (() => void);
  private parentIgnoreNext: boolean = false;

  private _lastValue?: T;
  override get value() {
    if (this._lastValue && this.observers.length !== 0) {
      return this._lastValue
    } else {
      return this.derivationFunction(this.parent.value);
    }
  }

  /**
   * Do not use this directly. Use {@link State#createLinked instead}.
   * @internal
   */
  constructor(
    private parent: State<FromT>,
    private derivationFunction: (value: FromT) => T,
    private setterFunction: (value: T) => FromT,
  ) {
    super(derivationFunction(parent.value));
  }

  protected override _subscribe(observer: Observer<T>) {
    if (!this.parentUnsubscriber)
      this.parentUnsubscriber = this.parent.subscribe(
        v => {
          if (this.parentIgnoreNext) { this.parentIgnoreNext = false; return; }
          else { this.parentIgnoreNext = true; }

          this.next(this.derivationFunction(v));
        }
      );
    const teardown = super._subscribe({
      ...observer,
      next: value => {
        if (this._lastValue === value) return; // "memoize"
        this._lastValue = value;
        observer.next(value);
      }
    });
    return () => {
      teardown();
      if (this.parentUnsubscriber) this.parentUnsubscriber();
    }
  }

  override next(valueOrSetter: T | ((currentValue: T) => T)) {
    if (this.completed) return;
    const newVal = valueOrSetter instanceof Function
      ? valueOrSetter(this.value) : valueOrSetter;
    super.next(newVal);

    if (this.parentIgnoreNext) { this.parentIgnoreNext = false; return; }
    else { this.parentIgnoreNext = true; }

    this.parent.next(this.setterFunction(newVal));
  }
}
