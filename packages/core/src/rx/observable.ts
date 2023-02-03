import { pipe } from "./util";

type TeardownLogic = (() => void) | void;

export type Observer<T> = {
  next(value: T): void,
  error(err: any): void,
  complete(): void,
}

export type ObserverDefinition<T> = Partial<Observer<T>> | ((value: T) => void);

export type OperatorFunction<InputT, ResultT> =
  (observable: Observable<InputT>) => Observable<ResultT>;

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
    if (!('next' in obs)) (obs as any).next = (v: T) => undefined;
    if (!('error' in obs)) (obs as any).error = (e: any) => { throw e; };
    if (!('complete' in obs)) (obs as any).complete = () => undefined;
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

  /** @ignore */
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

  // operators
  // ----------------------------------------------------------------------

  // this mess of types seems to sadly be necessary. this is copied straight from rxjs

  /** @ignore */
  pipe(): Observable<T>;

  /** @ignore */
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  /**
   * TODO
   */
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  /** @ignore */
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  /** @ignore */
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>
  ): Observable<D>;
  /** @ignore */
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  /** @ignore */
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>
  ): Observable<F>;
  /** @ignore */
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;
  /** @ignore */
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>
  ): Observable<H>;
  /** @ignore */
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;
  /** @ignore */
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<unknown>;

  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    return pipe(...operations)(this);
  }

  /** Shorthand for `.pipe(map(...))` */
  map<ReturnT>(mapper: (value: T) => ReturnT): Observable<ReturnT> {
    return _BasicOperators.map(mapper)(this);
  }

  /** Shorthand for `.pipe(filter(...))` */
  filter(filter: (value: T) => boolean): Observable<T> {
    return _BasicOperators.filter(filter)(this);
  }
}

/**
 * We cannot define these outside of this file if we want to have them immediatly
 * available as class-methods instead of only using pipe because that would result in a
 * cyclical dependency. rxjs decided to not allow using these as class-methods, which is
 * not an ideal api for simple use cases.
 * These are called "basic" because they will likely be used very frequently in common UI
 * code.
 * @internal
 */
export const _BasicOperators = {
  map: function <T, ReturnT>(
    mapper: (value: T) => ReturnT
  ): OperatorFunction<T, ReturnT> {
    return orig => new Observable(observer => {
      return orig.subscribe({
        ...observer,
        next: v => { observer.next(mapper(v)) },
      });
    })
  },

  filter: function <T>(filter: (value: T) => boolean): OperatorFunction<T, T> {
    return orig => new Observable(observer => {
      return orig.subscribe(v => { if (filter(v)) observer.next(v); })
    })
  }
}
