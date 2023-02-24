import memoizeOne from "./memoize-one";
import { Selectable } from "./selectable";
import Stream, { Observer } from "./stream";

/**
   A `Selector` *selects* aka *derives* state from an existing Selector or {@link State}
   object using a *pure* function.

   @example
   ```typescript
   const state = new State({a: 1, b: 4});
   const selector = Selector.create(state, value => value.a + 1);
   selector.subscribe(console.log); // => logs 2
   state.next(3); // => logs 4
   ```

   In the most simple case, this is similar to the `map` operator:

   ```typescript
   const state = new State({a: 1, b: 4});
   state.pipe(rx.map(v => v + 1)).subscribe(console.log); // => logs 2
   state.next(3); // => logs 4
   ```

   However, selectors can offer some additional features by being deliberately *less*
   powerful then operators:

   - They must always be free of side effects
   - They must always derive from some known state with an initial value
   - They cannot filter or delay emissions, they can only map values

   As a general rule of thumb, **always use selectors instead of operators when
   possible** since they are more efficient and easy to use. There are of course many
   cases where operators are simply necessary.

   ### The value of a selector can be accessed "imperatively"

   ```typescript
   const selector = Selector.create(
     new State({a: 1, b: 4}), value => value.a + 1
   );
   console.log(selector.value === 2) // => logs true
   ```

   ### Selectors are memoized

   When the arguments to a selector do not change, it does not have to run its defining
   function again and can instead return the previous value.
 */
export default class Selector<T> extends Stream<T> {

  private parentUnsubscribers: (() => void)[] = [];
  private parentValues: any[] = [];

  private observers: Observer<T>[] = [];

  private lastValue: T | undefined;

  /**
     Get the current value of this selector.

     Be aware that if this selector is not currently subscribed to anywhere, it must
     internally subscribe and unsubscribe and therefore execute the entire "chain" of its
     parent selectors. If there is an active subscription, the current value is returned
     immediatly without any computation.
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
   * Do not use this constructor directly. Instead, always use {@link Selector.create}.
   */
  private constructor(
    private parents: Selectable<any>[],
    private selectorFunction: (...args: any[]) => T
  ) {
    super(_observer => undefined);
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    this.observers.push(observer);

    if (this.observers.length === 1) {
      let complete = false;
      const memoized = memoizeOne(this.selectorFunction.bind(this));
      for (let i = 0; i < this.parents.length; i++) {
        if (i === this.parents.length - 1) complete = true;
        this.parentUnsubscribers.push(this.parents[i].subscribe(value => {
          this.parentValues[i] = value;
          if (complete) {
            this.lastValue = memoized(...this.parentValues);
            observer.next(this.lastValue);
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

  /** Shorthand for `{@link Selector.create}(this, definition)` */
  select<ReturnT>(definition: (value: T) => ReturnT): Selector<ReturnT> {
    return Selector.create(this, definition);
  }

  // nasty type definition incoming:

  /** @ignore */
  static create<R, A>(
    sa: Selectable<A>,
    def: (a: A) => R
  ): Selector<R>;

  /**
     Create a Selector from a set of {@link State} or existing Selector objects. The last
     argument is a function that will taking the values of the State/Selector objects
     defined in all prior arguments. There are overloads for providing up to eight parent
     State/Selector objects.

     @example
     ```typescript
     const s1 = new State(1);
     const s2 = new State(2);
     Selector.create(s1, s2, (v1, v2) => v1 + v2)
       .subscribe(console.log); // => logs 3
     s2.next(3); // => logs 5
     ```
   */
  static create<R, A, B>(
    sa: Selectable<A>, sb: Selectable<B>,
    def: (a: A, b: B) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>,
    def: (a: A, b: B, c: C) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C, D>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>, sd: Selectable<D>,
    def: (a: A, b: B, c: C, d: D) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C, D, E>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>, sd: Selectable<D>,
    se: Selectable<E>,
    def: (a: A, b: B, c: C, d: D, e: E) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C, D, E, F>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>, sd: Selectable<D>,
    se: Selectable<E>, sf: Selectable<F>,
    def: (a: A, b: B, c: C, d: D, e: E, f: F) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C, D, E, F, G>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>, sd: Selectable<D>,
    se: Selectable<E>, sf: Selectable<F>, sg: Selectable<G>,
    def: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R
  ): Selector<R>;

  /** @ignore */
  static create<R, A, B, C, D, E, F, G, H>(
    sa: Selectable<A>, sb: Selectable<B>, sc: Selectable<C>, sd: Selectable<D>,
    se: Selectable<E>, sf: Selectable<F>, sg: Selectable<G>, sh: Selectable<H>, 
    def: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R
  ): Selector<R>;

  /** @ignore */
  static create(...args: any[]): any {
    return new Selector(args.slice(0, -1), args[args.length - 1]);
  }
}
