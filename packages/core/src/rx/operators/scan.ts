import Stream, { OperatorFunction } from "../stream";

export default function scan<T>(
  accumulator: (acc: T, value: T, index: number) => T
): OperatorFunction<T, T>;

export default function scan<From, To>(
  accumulator: (acc: To, value: From, index: number) => To,
  seed: To
): OperatorFunction<From, To>;

/**
   Like `Array.prototype.reduce`, but for Streams, except a new value is emitted on every
   emission of the source Stream instead of only the last value.

   @example
   ```typescript
   rx.of([1, 2, 3, 4]).pipe(
     rx.scan((acc, curr) => acc + curr)
   ).subscribe(console.log);

   // will print: 1, 3, 6, 10

   rx.of([1, 2, 3, 4]).pipe(
     rx.scan((acc, curr) => acc + curr, 2)
   ).subscribe(console.log);

   // will print: 3, 5, 8, 12
   ```

   @group Stream Operators
 */
export default function scan<From, To>(
  accumulator: (acc: From | To, value: From, index: number) => From | To,
  seed?: To
): OperatorFunction<From, From | To> {
  return orig => new Stream(observer => {
    let accumulated: From | To;
    let index = 0;
    return orig.subscribe({
      ...observer, next: v => {
        if (accumulated === undefined) {
          accumulated = seed ? accumulator(seed, v, index++) : v;
          observer.next(accumulated);
          // console.debug('first: ', accumulated);
        } else {
          // console.debug('acc: ', accumulated, 'v: ', v);
          accumulated = accumulator(accumulated, v, index++);
          observer.next(accumulated);
        }
      }
    });
  });
}

