import { identity } from "../../util/other";
import Stream, { OperatorFunction } from "../stream";

/**
 * TODO
 */
export default function distinctUntilChanged<T, SelectedT>(
  comparator: (
    current: SelectedT, previous: SelectedT | typeof UNDEFINED
  ) => boolean
    = (current, previous) => current === previous,
  keySelector: (value: T) => SelectedT
    = identity as (v: T) => SelectedT,
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let previousValue: SelectedT | typeof UNDEFINED = UNDEFINED;
    return orig.subscribe(v => {
      const selected = keySelector(v);
      if (!comparator(selected, previousValue)) {
        observer.next(v);
        previousValue = selected;
      }
    })
  })
}

// guaranteed unique value to identify initial values
const UNDEFINED = Symbol();
