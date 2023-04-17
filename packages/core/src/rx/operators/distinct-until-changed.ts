import { identity } from "../../util/other";
import Stream, { OperatorFunction } from "../stream";

/**
   TODO

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
      if (!previousValue || !comparator(selected, previousValue)) {
        observer.next(v);
        previousValue = selected;
      }
    })
  })
}
