import Stream, { OperatorFunction } from "../stream";
import timer from "./creation/timer";

/**
   Debounce emissions using `durationSelector`. Most of the time, you probably will want
   to use {@link debounceTime}, which see for more details and an example.

   @group Stream Operators
 */
export function debounce<T>(
  durationSelector: (value: T) => Stream<any>, emitFirst: boolean = false,
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let unsubSelected: () => void | undefined;
    let isFirst = true;

    const unsub = orig.subscribe(value => {
      if (emitFirst && isFirst) {
        isFirst = false; observer.next(value); return;
      }
      if (unsubSelected) unsubSelected();
      unsubSelected = durationSelector(value).subscribe(
        () => observer.next(value)
      );
    });

    return () => {
      if (unsubSelected) unsubSelected();
      unsub();
    }
  });
}

/**
   Debounce a given Stream. This means that when the source emits new values, we wait for
   `ms`, discarding all values while waiting and only after no new values where emitted
   for `ms` do we emit the last value.

   Equivalent to `rx.{@link debounce}(_ => rx.{@link timer}(<ms>)`.

   @example
   ```typescript
   rx.fromEvent(document, 'click').pipe(
     rx.debounceTime(100)
   ).subscribe(console.log);

   // will only print *after no events where fired for 100 ms*
   ```

   @group Stream Operators

   @see {@link debounce}
   @see {@link throttleTime}
   @see https://web.archive.org/web/20220117092326/http://demo.nimius.net/debounce_throttle/
 */
export function debounceTime<T>(
  ms: number, emitFirst: boolean = false,
): OperatorFunction<T, T> {
  return orig => orig.pipe(debounce(_ => timer(ms), emitFirst));
}
