import Observable, { OperatorFunction } from "../observable";

/**
 * 'Select' a subset of this Observable and only update when the selected subset has
 * changed. Change is defined by `equalityCheck`, which by default is checking for
 * reference equality.
 */
export default function select<T, SelectedT>(
  selector: (value: T) => SelectedT,
  equalityCheck: (
    current: SelectedT, previous: SelectedT | typeof UNDEFINED
  ) => boolean = (current, previous) => current === previous,
): OperatorFunction<T, SelectedT> {
  return orig => new Observable(observer => {
    let previousValue: SelectedT | typeof UNDEFINED = UNDEFINED;
    return orig.subscribe(v => {
      const selected = selector(v);
      if (!equalityCheck(selected, previousValue)) {
        observer.next(selected);
        previousValue = selected;
      }
    })
  })
}

// guaranteed unique value to identify initial values (currently only in the `select`
// operator)
const UNDEFINED = Symbol();
