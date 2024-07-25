import Stream, { OperatorFunction } from "../stream";

/**
   Skip `count` emissions from the source {@link Stream}.

   @example
   ```typescript
   rx.of([1, 2, 3]).pipe(rx.skip(1)).subscribe(console.log);
   // prints
   // 2
   // 3
   ```

   @group Stream Operators
 */
export default function skip<T>(
  count: number
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let skipped = 0;
    return orig.subscribe(v => {
      skipped++;
      if (skipped > count) observer.next(v);
    })
  })
}
