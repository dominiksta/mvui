import Stream, { OperatorFunction } from "../stream";
import from, { StreamInput } from "./creation/from";

export default function mergeWith<T, A>(a: StreamInput<A>): OperatorFunction<T, A>;
export default function mergeWith<T, A, B>(
  a: StreamInput<A>, b: StreamInput<B>
): OperatorFunction<T, A | B>;
export default function mergeWith<T, A, B, C>(
  a: StreamInput<A>, b: StreamInput<B>, c: StreamInput<C>
): OperatorFunction<T, A | B | C>;
export default function mergeWith<T, A, B, C, D>(
  a: StreamInput<A>, b: StreamInput<B>, c: StreamInput<C>, d: StreamInput<D>
): OperatorFunction<T, A | B | C | D>;

/**
   Combine the input stream with the given streams, emitting a new value every time one of
   the input streams emits a value. Completes when all input streams have completed.
   
   @example
   ```typescript
   const ones = rx.interval(50).pipe(rx.map(() => 1), rx.take(3));
   const twos = rx.interval(50).pipe(rx.map(() => 2), rx.take(3));

   ones.pipe(rx.mergeWith(twos.pipe(rx.delay(10)))).subscribe(console.log);

   // will print: 1, 2, 1, 2, 1, 2
   ```
 
   @group Stream Operators

   @see {@link concatWith}
 */
export default function mergeWith<T>(
  ...streams: StreamInput<any>[]
): OperatorFunction<T, any> {
  return orig => new Stream(observer => {
    let origComplete = false;
    let argsComplete = streams.map(() => false);

    function maybeComplete() {
      if (origComplete && argsComplete.indexOf(false) === -1)
        observer.complete();
    }

    const origUnsub = orig.subscribe({
      ...observer,
      complete() { origComplete = true; maybeComplete(); }
    });
    const argUnsubs = streams.map((s, idx) => from(s).subscribe({
      ...observer,
      complete() { argsComplete[idx] = true; maybeComplete(); }
    }));

    return function teardown() {
      origUnsub();
      argUnsubs.forEach(unsub => unsub());
    }
  });
}
