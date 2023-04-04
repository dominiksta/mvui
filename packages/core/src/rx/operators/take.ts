import Stream, { OperatorFunction } from "../stream";

/**
   Take only `amount` elements from a stream and then complete.

   @example
   ```typescript
   rx.of([2, 3, 4, 5, 6]).pipe(rx.take(2)).subscribe(v => console.log(v);

   // will print: 2, 3
   ```

   ## See Also
   - {@link take}
 */
export default function take<T>(amount: number): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let emitted = 0;

    const unsub = orig.subscribe({
      ...observer,
      next(v) {
        emitted++;
        observer.next(v);
        if (emitted === amount) {
          // console.debug('take: complete');
          observer.complete(); 
        }
      }
    });

    return unsub;
  })
}
