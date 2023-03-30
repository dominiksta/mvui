import { OperatorFunction, _BasicOperators } from "../stream";

/**
 * Create a new Stream where values are transformed according to `mapper`.
 */
export function map<T, ReturnT>(
  mapper: (value: T, index: number) => ReturnT
): OperatorFunction<T, ReturnT> {
  return _BasicOperators.map(mapper);
}

/**
   Create a new Stream where that emits what is given in the if or else properties
   depending on the value of the original stream. Only works for boolean streams.

   Funtionally equivalent to map(v => v ? IF : ELSE), but ternaries sometimes end up being
   less readable.
 */
export function ifelse<TrueT, FalseT>(
  def: { if: TrueT, else: FalseT }
): OperatorFunction<boolean, TrueT | FalseT> {
  return _BasicOperators.ifelse(def);
};

/**
 * Create a new Stream where values are filtered according to `filter`.
 */
export function filter<T>(
  filter: (value: T) => boolean
): OperatorFunction<T, T> {
  return _BasicOperators.filter(filter);
}
