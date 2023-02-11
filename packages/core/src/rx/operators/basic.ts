import { OperatorFunction, _BasicOperators } from "../stream";

/**
 * Create a new Stream where values are transformed according to `mapper`.
 */
export function map<T, ReturnT>(
  mapper: (value: T) => ReturnT
): OperatorFunction<T, ReturnT> {
  return _BasicOperators.map(mapper);
}

/**
 * Create a new Stream where values are filtered according to `filter`.
 */
export function filter<T>(
  filter: (value: T) => boolean
): OperatorFunction<T, T> {
  return _BasicOperators.filter(filter);
}
