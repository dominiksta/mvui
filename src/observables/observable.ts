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
  protected _subscribe(observer: ((value: T) => void)) {
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
