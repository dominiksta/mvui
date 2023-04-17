import Stream, { OperatorFunction } from "../stream";

/**
   Does not modify the given Stream. Instead, `tap` simply allows you to run some side
   effect.

   @example
   ```typescript
   const s = new rx.State(0);
   s.pipe(
     rx.tap(v => console.log(v)),
     rx.map(v => v + 1),
     rx.tap(v => console.log(v)),
   ).subscribe();

   // logs: 0, 1

   s.next(4);

   // logs: 4, 5
   ```

   @group Stream Operators
 */
export default function tap<T>(
  callback: (value: T) => void
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    return orig.subscribe({
      ...observer,
      next(v) {
        callback(v);
        observer.next(v);
      }
    });
  })
}
