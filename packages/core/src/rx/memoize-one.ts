// shameless copy-paste from
// https://github.com/alexreardon/memoize-one/blob/master/src/memoize-one.ts

export function isEqualScalar(first: any, second: any): boolean {
  if (typeof first === 'object' || typeof second === 'object') return false;
  if (first === second) return true;
  // Special case for NaN (NaN !== NaN)
  if (Number.isNaN(first) && Number.isNaN(second)) return true;
  return false;
}

export function isEqualJSON(first: any, second: any): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

function areInputsEqual(
  newInputs: readonly any[],
  lastInputs: readonly any[],
  isEqual: EqualityFn,
): boolean {
  if (newInputs.length !== lastInputs.length) return false;
  for (let i = 0; i < newInputs.length; i++)
    if (!isEqual(lastInputs[i], newInputs[i])) return false;
  return true;
}

export type EqualityFn = (first: any, second: any) => boolean;

export type MemoizedFn<TFunc extends (this: any, ...args: any[]) => any> = {
  clear: () => void;
  (this: ThisParameterType<TFunc>, ...args: Parameters<TFunc>): ReturnType<TFunc>;
};

// internal type
type Cache<TFunc extends (this: any, ...args: any[]) => any> = {
  lastThis: ThisParameterType<TFunc>;
  lastArgs: Parameters<TFunc>;
  lastResult: ReturnType<TFunc>;
};

export default function memoizeOne<TFunc extends (this: any, ...newArgs: any[]) => any>(
  resultFn: TFunc,
  isEqual: EqualityFn = isEqualScalar,
): MemoizedFn<TFunc> {
  let cache: Cache<TFunc> | null = null;

  // breaking cache when context (this) or arguments change
  function memoized(
    this: ThisParameterType<TFunc>,
    ...newArgs: Parameters<TFunc>
  ): ReturnType<TFunc> {
    if (
      cache
      && cache.lastThis === this
      && areInputsEqual(newArgs, cache.lastArgs, isEqual)
    ) {
      return cache.lastResult;
    }

    // Throwing during an assignment aborts the assignment:
    // https://codepen.io/alexreardon/pen/RYKoaz
    // Doing the lastResult assignment first so that if it throws
    // the cache will not be overwritten
    const lastResult = resultFn.apply(this, newArgs);
    cache = {
      lastResult,
      lastArgs: newArgs,
      lastThis: this,
    };

    return lastResult;
  }

  // Adding the ability to clear the cache of a memoized function
  memoized.clear = function clear() {
    cache = null;
  };

  return memoized;
}
