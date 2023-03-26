import Stream, { OperatorFunction } from "../stream";

/**
   Retry a stream on error `amount` times.

   @example
   ```typescript
   new rx.Stream<number>(observer => {
     observer.next(1);
     observer.next(2);
     observer.next(3);
     throw new Error('hi');
     observer.next(4);
   }).pipe(
     rx.retry(2),
     rx.catchError(_ => rx.of([ 1337 ]))
   ).subscribe(x => console.log);

   // prints: 1, 2, 3, 1, 2, 3, 1337
   ```
 */
export default function retry<T>(amount: number = Infinity): OperatorFunction<T, T> {
  return orig => new Stream(observer => {

    let retries = 1;
    let unsub: (() => void)[] = [];
    
    const subscribeForRetry = () => {
      unsub[retries] = orig.subscribe({
        ...observer,
        error(e) {
          if (retries++ < amount) {
            subscribeForRetry();
            unsub[retries - 1]();
          } else {
            observer.error(e);
          }
        }
      });
    };

    subscribeForRetry();
  });
}
