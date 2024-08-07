import Stream, { OperatorFunction } from "../stream";

/**
   Emits the values from the source {@link Stream} unchanged, unless the emission takes
   too long. The timeout for the first emission and subsequent emissions can be specified
   seperately.

   @example
   ```typescript
    rx.interval(50).pipe(rx.timeout(20)).subscribe({
      error() { console.log('this errors!'); }
    });
   ```

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
