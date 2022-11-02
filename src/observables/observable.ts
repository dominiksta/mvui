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
   * Returns a Subscription object that you may want to store to later be able to
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
  
}
