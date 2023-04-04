import Stream, { OperatorFunction } from "../stream";

/**
   Immediatly emit the given value, then just subscribe to the input Stream.

   @example
   ```typescript
   rx.interval(100).pipe(
     rx.startWith(1337)
   ).subscribe(console.log);

   // will log 1337 (100ms pause), 0 (100ms pause), 1 (100ms pause), ...
   ```
 */
export default function startWith<T>(value: T): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    observer.next(value);
    return orig.subscribe(observer);
  })
}
