import memoizeOne from "./memoize-one";
import { Derivable } from "./derivable";
import Stream, { Observer } from "./stream";

/**
   A `DerivedState` object derives state from an existing DerivedState or {@link State}
   object using a *pure* function.

   @example
   ```typescript
   const state = new rx.State({a: 1, b: 4});
   const derived = rx.derive(state, value => value.a + 1);
   derived.subscribe(console.log); // => logs 2
   state.next(3); // => logs 4
   ```

   In the most simple case, this is similar to the `map` operator:

   ```typescript
   const state = new rx.State({a: 1, b: 4});
   state.pipe(rx.map(v => v + 1)).subscribe(console.log); // => logs 2
   state.next(3); // => logs 4
   ```

   However, DerivedState can offer some additional features by being deliberately *less*
   powerful then operators:

   - They must always be free of side effects
   - They must always derive from some known state with an initial value
   - They cannot filter or delay emissions, they can only map values

   As a general rule of thumb, **always use DerivedState instead of operators when
   possible** since they are more efficient and easy to use. There are of course many
   cases where operators are simply necessary.

   ### The value of DerivedState can be accessed "imperatively"

   ```typescript
   const derived = rx.derive(
     new rx.State({a: 1, b: 4}), value => value.a + 1
   );
   console.log(derived.value === 2) // => logs true
   ```

   ### DerivedState is memoized

   When the arguments to DerivedState do not change, it does not have to run its defining
   function again and can instead return the previous value.
 */
export class DerivedState<T> extends Stream<T> {

  private parentUnsubscribers: (() => void)[] = [];
  private parentValues: any[] = [];

  private observers: Observer<T>[] = [];

  private lastValue: T | undefined;

  /**
     Get the current value of this DerivedState.

     Be aware that if this DerivedState is not currently subscribed to anywhere, it must
     internally subscribe and unsubscribe and therefore execute the entire "chain" of its
     parent DerivedState objects. If there is an active subscription, the current value is
     returned immediatly without any computation.
   */
  get value(): T {
    if (this.lastValue && this.observers.length !== 0) {
      return this.lastValue;
    } else {
      let ret!: T;
      this.subscribe(v => ret = v)();
      return ret;
    }
  }

  /**
   * Do not use this constructor directly. Instead, always use rx.{@link derive}.
   */
  private constructor(
    private parents: Derivable<any>[],
    private derivationFunction: (...args: any[]) => T
  ) {
    super(_observer => undefined);
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    this.observers.push(observer);

    if (this.observers.length === 1) {
      let complete = false;
      const memoized = memoizeOne(this.derivationFunction.bind(this));
      for (let i = 0; i < this.parents.length; i++) {
        if (i === this.parents.length - 1) complete = true;
        this.parentUnsubscribers.push(this.parents[i].subscribe(value => {
          this.parentValues[i] = value;
          if (complete) {
            this.lastValue = memoized(...this.parentValues);
            for (let obs of this.observers) obs.next(this.lastValue);
          }
        }));
      }
    } else {
      observer.next(this.lastValue!);
    }

    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) this.observers.splice(index, 1);

      if (this.observers.length === 0) {
        for (const unsub of this.parentUnsubscribers) unsub();
      }
    }
  }

  /** Shorthand for rx.{@link derive}(this, definition) */
  derive<ReturnT>(definition: (value: T) => ReturnT): DerivedState<ReturnT> {
    return DerivedState.__create(this, definition);
  }

  /** @ignore */
  static __create(...args: any[]): any {
    return new DerivedState(args.slice(0, -1), args[args.length - 1]);
  }
}

// nasty type definition incoming:

/** @ignore */
export function derive<R, A>(
  sa: Derivable<A>,
  def: (a: A) => R
): DerivedState<R>;

/**
   Create a {@link DerivedState} from a set of {@link State} or existing DerivedState
   objects. The last argument is a function that will taking the values of the
   State/DerivedState objects defined in all prior arguments. There are overloads for
   providing up to eight parent State/DerivedState objects.

   See {@link DerivedState} for details.

   @example
   ```typescript
   const s1 = new State(1);
   const s2 = new State(2);
   rx.derive(s1, s2, (v1, v2) => v1 + v2)
     .subscribe(console.log); // => logs 3
   s2.next(3); // => logs 5
   ```
 */
export function derive<R, A, B>(
  sa: Derivable<A>, sb: Derivable<B>,
  def: (a: A, b: B) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>,
  def: (a: A, b: B, c: C) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C, D>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>, sd: Derivable<D>,
  def: (a: A, b: B, c: C, d: D) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C, D, E>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>, sd: Derivable<D>,
  se: Derivable<E>,
  def: (a: A, b: B, c: C, d: D, e: E) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C, D, E, F>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>, sd: Derivable<D>,
  se: Derivable<E>, sf: Derivable<F>,
  def: (a: A, b: B, c: C, d: D, e: E, f: F) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C, D, E, F, G>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>, sd: Derivable<D>,
  se: Derivable<E>, sf: Derivable<F>, sg: Derivable<G>,
  def: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R
): DerivedState<R>;

/** @ignore */
export function derive<R, A, B, C, D, E, F, G, H>(
  sa: Derivable<A>, sb: Derivable<B>, sc: Derivable<C>, sd: Derivable<D>,
  se: Derivable<E>, sf: Derivable<F>, sg: Derivable<G>, sh: Derivable<H>,
  def: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R
): DerivedState<R>;

/** @ignore */
export function derive(...args: any[]): any {
  return DerivedState.__create(...args);
}
