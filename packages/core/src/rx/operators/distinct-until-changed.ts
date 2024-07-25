import { identity } from "../../util/other";
import Stream, { OperatorFunction } from "../stream";

/**
   Create a {@link Stream} that will only emit new values when the value of its input
   stream has changed.

   @example
   ```typescript
   rx.of([1, 1, 2, 3]).pipe(rx.distinctUntilChanged()).subscribe(console.log);
   // prints
   // 1
   // 2
   // 3
   ```

   @group Stream Operators
 */
export default function distinctUntilChanged<T, SelectedT>(
  comparator: (
    current: SelectedT, previous: SelectedT
  ) => boolean
    = (current, previous) => current === previous,
  keySelector: (value: T) => SelectedT
    = identity as (v: T) => SelectedT,
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let previousValue: SelectedT | undefined;
    return orig.subscribe(v => {
      const selected = keySelector(v);
      if (
        previousValue === undefined
        || !comparator(selected, previousValue)
      ) {
        observer.next(v);
        previousValue = selected;
      }
    })
  })
}
