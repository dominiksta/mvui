import Stream, { OperatorFunction } from "../stream";

/**
   Complete the input Stream when the given `notifier` Stream emits.

   @example
   ```typescript
   rx.interval(1000 * 10).pipe(
     rx.takeUntil(rx.timer(1000 * 4 + 100)
   ).subscribe(console.log);

   // will log 1, 2, 3, 4
   ```

   ## See Also
   - {@link take}
 */
export default function takeUntil<T>(notifier: Stream<any>): OperatorFunction<T, T> {
  return orig => new Stream(observer => {

    const unsubOrig = orig.subscribe(observer);

    const unsubNotifier = notifier.subscribe(() => {
      observer.complete();
      unsubOrig();
    });

    return () => {
      unsubNotifier();
      unsubOrig();
    };
  })
}
