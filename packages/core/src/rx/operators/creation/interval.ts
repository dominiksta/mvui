import Stream from "../../stream";

/**
   Create a {@link Stream} that emits a new increasing number starting at zero every `ms`
   milliseconds.

   @example
   ```typescript
   rx.interval(100).subscribe(console.log);
   // prints in 100 ms intervals:
   // 0
   // 1
   // 2
   // ...
   ```

   @group Stream Creation Operators
 */
export default function interval(
  ms: number
): Stream<number> {
  return new Stream(observer => {
    let iteration = 0;
    const interval = setInterval(() => {
      observer.next(iteration++);
    }, ms);

    return function teardown() {
      clearInterval(interval);
    }
  })
}
