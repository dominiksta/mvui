type TeardownLogic = (() => void) | void;

export type Observer<T> = {
  next(value: T): void,
  error(err: any): void,
  complete(): void,
}

export type ObserverDefinition<T> = Partial<Observer<T>> | ((value: T) => void);

/**
 * A potentially asynchronous series of values which can be subscribed to for basic
 * reactive programming.
 */
export default class Observable<T> {

  protected completed = false;

  constructor(
    private definition: (observer: Observer<T>) => TeardownLogic
  ) { }

  // subscriptions
  // ----------------------------------------------------------------------

  private static definitionToObserver<T>(def: ObserverDefinition<T>): Observer<T> {
    let obs: Observer<T> = def as any;
    if (def instanceof Function) {
      obs = { next: def } as any;
    }
    if (!('next' in obs)) obs.next = v => undefined;
    if (!('error' in obs)) obs.error = e => { throw e; };
    if (!('complete' in obs)) obs.complete = () => undefined;
    return obs;
  }

  /**
   * 'Subscribe' to this observable with a function. Whenever a new value is emitted (that
   * is, the `next` function passed to the subscriber in the constructor is called),
   * `observer` will be called with the new value.
   * Returns a 'unsubscribe' function that you may want to store to later be able to
   * unsubscribe. Note that if an observable does not complete, not unsubscribing is a
   * memory leak.
   */
  subscribe(observer: ObserverDefinition<T>): () => void {
    return this._subscribe(Observable.definitionToObserver(observer))
      ?? (() => null);
  }

  protected _subscribe(observer: Observer<T>): TeardownLogic {
    try {
      const subscriber: Observer<T> = {
        ...observer,
        complete: () => {
          observer.complete();
          subscriber.next = _ => undefined;
        },
      }
      return this.definition(subscriber);
    } catch (e) {
      observer.error(e);
    }
  }

  // helpers
  // ----------------------------------------------------------------------

  /**
   * The only purpose of this is to call the constructor without binding `this` in passed
   * arguments.
   */
  private static _create<T>(
    definition: (observer: Observer<T>) => TeardownLogic
  ) {
    return new Observable(definition);
  }

  // operators
  // ----------------------------------------------------------------------

  /**
   * Create a new observable where values are transformed according to `mapper`.
   */
  map<ReturnT>(mapper: (value: T) => ReturnT): Observable<ReturnT> {
    return Observable._create(observer => {
      return this.subscribe({
        ...observer,
        next: v => { observer.next(mapper(v)) },
      });
    })
  }

  /**
   * Create a new observable where values are filtered according to `filter`.
   */
  filter(filter: (value: T) => boolean): Observable<T> {
    return Observable._create(observer => {
      return this.subscribe(v => { if (filter(v)) observer.next(v) })
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
    return Observable._create(observer => {
      let previousValue: SelectedT | typeof UNDEFINED = UNDEFINED;
      return this.subscribe(v => {
        const selected = selector(v);
        if (!equalityCheck(selected, previousValue)) {
          observer.next(selected);
          previousValue = selected;
        }
      })
    })
  }

  // operators: fromLatest
  // ----------------------------------------------------------------------

  static fromLatest<T extends any[]>(
    sources: [...{[K in keyof T]: Observable<T[K]>}]
  ): Observable<T>;

  static fromLatest<T extends any[]>(
    ...sources: [...{[K in keyof T]: Observable<T[K]>}]
  ): Observable<T>;

  static fromLatest<T extends { [key: string]: Observable<any> }>(
    sources: T
  ): Observable<{ [K in keyof T]: T[K] extends Observable<infer I> ? I : never }>;

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
  static fromLatest(
    ...args: any[]
  ): any {
    if (args[0] instanceof Array) { // fromLatest([obs1$, obs2$])
      return this._fromLatestArr(args[0]);
    } else if (args.length > 1) { // fromLatest(obs1$, obs2$)
      return this._fromLatestArr(args);
    } else { // fromLatest({o1: obs1$, o2: obs2$})
      return this._fromLatestObj(args[0]);
    }
  }

  // implementation for first fromLatest override
  private static _fromLatestArr<T extends any[]>(
    sources: [...{[K in keyof T]: Observable<T[K]>}]
  ): Observable<T> {
    return new Observable(observer => {
      let values: any[] = [];

      const teardowns = sources.map((source, i) => source.subscribe(v => {
        values[i] = v;
        if (values.filter(v => v !== undefined).length === sources.length) {
          observer.next(values as any);
        }
      }));

      return () => { for (let t of teardowns) if (t) t(); };
    });
  }

  // implementation for second fromLatest override
  private static _fromLatestObj<T extends { [key: string]: Observable<any> }>(
    sources: T
  ): Observable<{ [K in keyof T]: T[K] extends Observable<infer I> ? I : never }> {
    return new Observable(observer => {
      const values: Partial<{
        [K in keyof T]: T[K] extends Observable<infer I> ? I : never
      }> = {};

      const sourceKeys = Object.keys(sources);

      const teardowns = sourceKeys.map(key => sources[key].subscribe(v => {
        (values as any)[key] = v;
        if (sourceKeys.filter(k => values[k] === undefined).length === 0) {
          observer.next(values as any);
        }
      }));

      return () => { for (let t of teardowns) if (t) t(); };
    });
  }
}

// guaranteed unique value to identify initial values (currently only in the `select`
// operator)
const UNDEFINED = Symbol();
