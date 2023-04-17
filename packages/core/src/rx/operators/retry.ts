import Stream, { OperatorFunction } from "../stream";
import { of, timer } from "./creation";

/**
   Retry a stream on error `amount` times.

   ## Basic Example

   ```typescript
   new rx.Stream<number>(observer => {
     observer.next(1); observer.next(2); observer.next(3);
     throw new Error('hi'); observer.next(4);
   }).pipe(
     rx.retry(2),
     rx.catchError(_ => rx.of([ 1337 ]))
   ).subscribe(x => console.log);

   // prints: 1, 2, 3, 1, 2, 3, 1337
   ```

   ## Delaying a retry

   ```typescript
   new rx.Stream<number>(observer => {
     observer.next(1); observer.next(2); observer.next(3);
     throw new Error('hi'); observer.next(4);
   }).pipe(
     rx.retry(2, { delay: 100 }),
     rx.catchError(_ => rx.of([ 1337 ]))
   ).subscribe(x => console.log);
   ```

   ## Conditionally aborting

   ```typescript
   new rx.Stream<number>(observer => {
     observer.next(1); observer.next(2); observer.next(3);
     throw new Error('hi'); observer.next(4);
   }).pipe(
     rx.retry(Infinity, { delay: () => {
        values.length > 5 ? rx.throwError(new Error('yes')) : rx.timer(100),
     }),
     rx.catchError(_ => rx.of([ 1337 ]))
   ).subscribe(x => console.log);
   ```

   @group Stream Operators
   @see https://rxjs-dev.firebaseapp.com/api/index/function/retry
 */
export default function retry<T>(
  amount: number = Infinity,
  config: {
    delay?: number | ((error: any, lastValue: T | undefined) => Stream<any>),
    resetOnSuccess?: boolean
  } = {
    delay: 0,
    resetOnSuccess: false,
  },
): OperatorFunction<T, T> {
  const _config = {
    delay: 0,
    resetOnSuccess: false,
    ...config,
  }

  const _delay = _config.delay;
  const delay = typeof _delay === 'number'
    ? (_delay === 0 ? (() => of([null])) : (() => timer(_delay)))
    : _delay;

  return orig => new Stream(observer => {

    let retries = 0;
    let lastValue: T | undefined = undefined;
    let unsub: (() => void)[] = [];
    
    const subscribeForRetry = () => {
      unsub[retries] = orig.subscribe({
        ...observer,
        next(v) {
          if (_config.resetOnSuccess) retries = 0;
          lastValue = v;
          observer.next(v);
        },
        error(e) {
          if (retries++ < amount) {
            let unsubDelay = delay(e, lastValue).subscribe({
              next() {
                subscribeForRetry();
                unsub[retries - 1]();
                unsubDelay();
              },
              error(e2) {
                observer.error(e2);
              }
            });
          } else {
            observer.error(e);
          }
        }
      });
    };

    subscribeForRetry();
  });
}
