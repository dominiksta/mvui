import Stream, { OperatorFunction } from "../stream";
import from, { StreamInput } from "./creation/from";

export default function concatWith<T, A>(a: StreamInput<A>): OperatorFunction<T, A>;
export default function concatWith<T, A, B>(
  a: StreamInput<A>, b: StreamInput<B>
): OperatorFunction<T, A | B>;
export default function concatWith<T, A, B, C>(
  a: StreamInput<A>, b: StreamInput<B>, c: StreamInput<C>,
): OperatorFunction<T, A | B | C>;

/**
   Combine the input stream with the given streams, waiting for each stream to complete in
   turn. Completes when all input streams have completed.
   
   @example
   ```typescript
   const ones = rx.interval(10).pipe(rx.map(() => 1), rx.take(3));
   const twos = rx.interval(10).pipe(rx.map(() => 2), rx.take(3));

   ones.pipe(rx.mergeWith(twos.pipe(rx.delay(10)))).subscribe(console.log);

   // will print: 1, 1, 1, 2, 2, 2
   ```
 
   @group Stream Operators

   @see {@link mergeWith}
 */
export default function concatWith<T>(
  ...inputs: StreamInput<any>[]
): OperatorFunction<T, any> {
  return orig => new Stream(observer => {
    const streams = [orig, ...inputs.map(from)];
    let unsubs: (() => void)[] = [];
    const unsubAll = () => {
      unsubs.forEach(unsub => unsub());
      unsubs = [];
    };

    function subscribeToIdx(idx: number) {
      unsubAll();

      unsubs.push(streams[idx].subscribe({
        ...observer,
        complete() {
          if (idx == (streams.length - 1)) {
            unsubAll();
            observer.complete(); 
          }
          else subscribeToIdx(idx + 1)
        }
      }))
    }

    subscribeToIdx(0);

    return unsubAll;
  });
}
