import Observable from "../../observable";

/** @ignore */
export function fromLatest<T extends any[]>(
  sources: [...{ [K in keyof T]: Observable<T[K]> }]
): Observable<T>;

/**
 * Combine the latest values of the given Observables. Emits every time one of the
 * sources emits, but only once all sources have emitted at least once.
 *
 * @example
 * ```ts
 * const [counter, multiplier] = [new Subject(2), new Subject(2)];
 * const sum = fromLatest(counter, multiplier).map([c, m] => c * m);
 * sum.subscribe(console.log); // => 4
 * counter.next(3); // => 6
 * ```
 */
export function fromLatest<T extends any[]>(
  ...sources: [...{ [K in keyof T]: Observable<T[K]> }]
): Observable<T>;

/**
 * Combine the latest values of the given Observables. Emits every time one of the
 * sources emits, but only once all sources have emitted at least once.
 *
 * @example
 * ```ts
 * const [counter, multiplier] = [new Subject(2), new Subject(2)];
 * const sum = fromLatest({c: counter, m: multiplier}).map(v => v.c * v.m);
 * sum.subscribe(console.log); // => 4
 * counter.next(3); // => 6
 * ```
 */
export function fromLatest<T extends { [key: string]: Observable<any> }>(
  sources: T
): Observable<{ [K in keyof T]: T[K] extends Observable<infer I> ? I : never }>;

export function fromLatest(
  ...args: any[]
): any {
  if (args[0] instanceof Array) { // fromLatest([obs1$, obs2$])
    return _fromLatestArr(args[0]);
  } else if (args.length > 1) { // fromLatest(obs1$, obs2$)
    return _fromLatestArr(args);
  } else { // fromLatest({o1: obs1$, o2: obs2$})
    return _fromLatestObj(args[0]);
  }
}

// implementation for first fromLatest override
function _fromLatestArr<T extends any[]>(
  sources: [...{ [K in keyof T]: Observable<T[K]> }]
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
function _fromLatestObj<T extends { [key: string]: Observable<any> }>(
  sources: T
): Observable < { [K in keyof T]: T[K] extends Observable<infer I> ? I : never } > {
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
