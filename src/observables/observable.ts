type TeardownLogic = (() => void) | void;

/**
 * A potentially asynchronous series of values which can be subscribed to for basic
 * reactive programming.
 */
export default class Observable<T> {

  constructor(
    private definition: (next: (value: T) => void) => TeardownLogic
  ) { }

  // subscriptions
  // ----------------------------------------------------------------------

  /**
   * 'Subscribe' to this observable with a function. Whenever a new value is emitted (that
   * is, the `next` function passed to the subscriber in the constructor is called),
   * `observer` will be called with the new value.
   * Returns a 'unsubscribe' function that you may want to store to later be able to
   * unsubscribe. Note that if an observable does not complete, not unsubscribing is a
   * memory leak.
   */
  subscribe(observer: ((value: T) => void)): () => void {
    return this._subscribe(observer) ?? (() => null);
  }

  /**
   * Subscribe without propagating the subscription to the parentage or other any other
   * side effects.
   */
  protected _subscribe(observer: ((value: T) => void)): TeardownLogic {
    return this.definition(observer);
  }

  // helpers
  // ----------------------------------------------------------------------

  /**
   * The only purpose of this is to call the constructor without binding `this` in passed
   * arguments.
   */
  private static _create<T>(
    definition: (next: (value: T) => void) => TeardownLogic
  ) {
    return new Observable(definition);
  }

  // operators
  // ----------------------------------------------------------------------

  /**
   * Create a new observable where values are transformed according to `mapper`.
   */
  map<ReturnT>(mapper: (value: T) => ReturnT): Observable<ReturnT> {
    return Observable._create(next => {
      return this._subscribe(v => { next(mapper(v)) })
    })
  }

  /**
   * Create a new observable where values are filtered according to `filter`.
   */
  filter(filter: (value: T) => boolean): Observable<T> {
    return Observable._create(next => {
      return this._subscribe(v => { if (filter(v)) next(v) })
    })
  }

  /**
   * Combine the latest values of the given Observables. Emits every time one of the
   * sources emits, but only once all sources have emitted at least once.
   *
   * ## Examples
   * ```ts
   * const [counter, multiplier] = [new Subject(2), new Subject(2)];
   * const sum = Observable.fromLatest(
   *   {c: counter, m: multiplier}
   * ).map(v => v.c * v.m);
   * sum.subscribe(console.log); // => 4
   * counter.next(3); // => 6
   * ```
   */
  static fromLatest<T extends { [key: string]: Observable<any> }>(
    sources: T
  ): Observable<{ [K in keyof T]: T[K] extends Observable<infer I> ? I : never }> {
    return new Observable(next => {
      const values: Partial<{
        [K in keyof T]: T[K] extends Observable<infer I> ? I : never
      }> = {};

      const sourceKeys = Object.keys(sources);

      const teardowns = sourceKeys.map(key => sources[key]._subscribe(v => {
        (values as any)[key] = v;
        if (sourceKeys.filter(k => values[k] === undefined).length === 0) {
          next(values as any);
        }
      }));

      return () => { for (let t of teardowns) if (t) t(); };
    });
  }

  /**
   * 'Select' a subset of this Observable and only update when the selected subset has
   * changed. Change is defined by `equalityCheck`, which by default is checking for
   * reference equality.
   */
  select<SelectedT>(
    selector: (value: T) => SelectedT,
    equalityCheck: (
      current: SelectedT, previous: SelectedT | typeof UNDEFINED
    ) => boolean = (current, previous) => current === previous,
  ): Observable<SelectedT> {
    return Observable._create(next => {
      let previousValue: SelectedT | typeof UNDEFINED = UNDEFINED;
      return this._subscribe(v => {
        const selected = selector(v);
        if (!equalityCheck(selected, previousValue)) {
          next(selected);
          previousValue = selected;
        }
      })
    })
  }

}

// guaranteed unique value to identify initial values (currently only in the `select`
// operator)
const UNDEFINED = Symbol();
