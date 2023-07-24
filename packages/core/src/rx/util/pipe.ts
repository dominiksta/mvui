
// this mess of types seems to sadly be necessary. this is copied straight from rxjs
export default function pipe<T>(): (v: T) => T;
export default function pipe<T, A>(fn1: (v: T) => A): (v: T) => A;
export default function pipe<T, A, B>(
  fn1: (v: T) => A, fn2: (v: A) => B
): (v: T) => B;
export default function pipe<T, A, B, C>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C,
): (v: T) => C;
export default function pipe<T, A, B, C, D>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
): (v: T) => D;
export default function pipe<T, A, B, C, D, E>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
  fn5: (v: D) => E,
): (v: T) => E;
export default function pipe<T, A, B, C, D, E, F>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
  fn5: (v: D) => E, fn6: (v: E) => F,
): (v: T) => F;
export default function pipe<T, A, B, C, D, E, F, G>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
  fn5: (v: D) => E, fn6: (v: E) => F, fn7: (v: F) => G,
): (v: T) => G;
export default function pipe<T, A, B, C, D, E, F, G, H>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
  fn5: (v: D) => E, fn6: (v: E) => F, fn7: (v: F) => G, fn8: (v: G) => H,
): (v: T) => H;
export default function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D,
  fn5: (v: D) => E, fn6: (v: E) => F, fn7: (v: F) => G, fn8: (v: G) => H,
  fn9: (v: H) => I,
): (v: T) => I;


/**
 * Return a new function that will execute the given functions in order on each others
 * output. Useful for creating custom operators.
 */
export default function pipe(...fns: ((v: any) => any)[]): ((v: any) => any) {
  if (fns.length === 0) return v => v;
  if (fns.length === 1) return fns[0];

  return function piped(input) {
    return fns.reduce((prev, fn) => fn(prev), input);
  };
}
