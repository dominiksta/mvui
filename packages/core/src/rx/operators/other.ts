import EmptyError from "../empty-error";
import Stream, { OperatorFunction } from "../stream";
import { map } from "./basic";
import scan from "./scan";

export function last<T>(): OperatorFunction<T, T>;
export function last<T, D>(defaultValue: D): OperatorFunction<T, T | D>;
/**
   Wait until the input Stream completes, then emit the last value. If no defaultValue is
   given, the output Stream will throw an EmptyError if the input Stream is empty.

   @group Stream Operators
 */
export function last<T, D>(defaultValue?: D): OperatorFunction<T, T | D> {
  return orig => new Stream(observer => {
    let value: T | D | undefined = defaultValue;
    let hasValue = false;
    orig.subscribe({
      ...observer,
      next(v) {
        hasValue = true;
        value = v;
      },
      complete() {
        if (!hasValue && defaultValue === undefined)
          observer.error(new EmptyError());
        else
          observer.next(value!);
      },
    })
  })
}

export function first<T>(): OperatorFunction<T, T>;
export function first<T, D>(defaultValue: D): OperatorFunction<T, T | D>;
/**
   Wait until the input Stream emits its first value, emit that, then complete. If no
   defaultValue is given, the output Stream may throw an EmptyError if no first value was
   emitted from the input.

   @group Stream Operators
 */
export function first<T, D>(defaultValue?: D): OperatorFunction<T, T | D> {
  return orig => new Stream(observer => {
    let hasValue = false;
    orig.subscribe({
      ...observer,
      next(v) {
        hasValue = true;
        observer.next(v);
        observer.complete();
      },
      complete() {
        if (!hasValue && defaultValue === undefined)
          observer.error(new EmptyError());
        else
          observer.next(defaultValue!);
      },
    })
  })
}

/**
   Emit `defaultValue` is input stream is empty, otherwise emit input stream
   unchanged.

   @group Stream Operators
 */
export function defaultIfEmpty<T>(defaultValue: T): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let hasValue = false;
    return orig.subscribe({
      ...observer,
      next(v) {
        hasValue = true;
        observer.next(v);
      },
      complete() {
        if (!hasValue) observer.next(defaultValue);
        observer.complete();
      }
    })
  })
}

function findInternal<T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, {val?: T, idx?: number}> {
  return orig => new Stream(observer => {
    let found = false;
    let idx = -1;
    return orig.subscribe({
      ...observer,
      next(v) {
        idx++;
        if (predicate(v)) {
          found = true;
          observer.next({val: v, idx});
          observer.complete();
        }
      },
      complete() {
        if (!found) observer.next({});
        observer.complete();
      }
    })
  })
}

/**
   Emit the first value in the input stream matching `predicate`, then complete. If no
   value matches predicate, emit `undefined`.

   @group Stream Operators

   @see {@link findIndex}
 */
export function find<T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, T | undefined> {
  return orig => orig.pipe(findInternal(predicate), map(v => v.val))
}

/**
   Emit the index of the first value in the input stream matching `predicate`, then
   complete. If no value matches predicate, emit `undefined`.

   @group Stream Operators

   @see {@link find}
 */
export function findIndex<T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, number | undefined> {
  return orig => orig.pipe(findInternal(predicate), map(v => v.idx))
}

/**
   Collect all values of the input stream, wait for it to complete, then emit all values
   as a single array.

   @group Stream Operators
 */
export function toArray<T>(): OperatorFunction<T, T[]> {
  return orig => new Stream(observer => {
    const values: T[] = [];
    return orig.subscribe({
      ...observer,
      next(v) { values.push(v); },
      complete() { observer.next(values); }
    })
  })
}

/**
   Emit `true` if all input stream values match `predicate`. As soon as one input value
   does not match `predicate`, emit `false` and complete.

   @group Stream Operators
 */
export function every<T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, boolean> {
  return orig => new Stream(observer => {
    return orig.subscribe({
      ...observer,
      next(v) {
        if (!predicate(v)) {
          observer.next(false); 
          observer.complete();
        }
      },
      complete() {
        observer.next(true);
        observer.complete();
      }
    })
  })
}


/**
   Count all emissions of the input stream until it completes, then emit that count.

   @group Stream Operators
 */
export function count<T>(): OperatorFunction<T, number> {
  return orig => orig.pipe(scan((acc) => acc + 1, 0), last(0));
}

/**
   Wait for input stream to complete, then emit `true` if no values were emitted by the
   input stream. (Emit `false` otherwise.)

   @group Stream Operators
 */
export function isEmpty<T>(): OperatorFunction<T, boolean> {
  return orig => orig.pipe(count()).map(v => v === 0);
}
