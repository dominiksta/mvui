import Stream, { OperatorFunction } from "../stream";

/**
   TODO

   @group Stream Operators
 */
export default function timeout<T>(
  first: number = Infinity,
  each: number = Infinity,
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    const timeoutFirst = (first === Infinity) ? Infinity : setTimeout(
      () => observer.error(`timeout: first ${first}ms`),
      first
    ) as any as number;

    const mkTimeoutEach = () => (each === Infinity) ? Infinity : setTimeout(
      () => observer.error(`timeout: each ${each}ms`),
      each
    ) as any as number;
    let timeoutEach = mkTimeoutEach();

    const unsubOrig = orig.subscribe({
      ...observer,
      next(v) {
        clearTimeout(timeoutFirst);
        clearTimeout(timeoutEach);
        timeoutEach = mkTimeoutEach();
        observer.next(v);
      },
      complete() {
        clearTimeout(timeoutEach);
      }
    });

    return unsubOrig;
  });
}
