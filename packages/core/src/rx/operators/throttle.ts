import Stream, { OperatorFunction } from "../stream";
import { timer } from "./creation";

/**
   Throttle emissions using `durationSelector`. Most of the time, you probably will want
   to use {@link throttleTime}, which see for more details and an example.

   @group Stream Operators
 */
export function throttle<T>(
  durationSelector: (value: T) => Stream<any>,
  config?: {
    leading?: boolean,
    trailing?: boolean,
  }
): OperatorFunction<T, T> {
  const _config = {
    leading: true,
    trailing: false,
    ...config,
  }

  return orig => new Stream(observer => {
    let unsubSelected: () => void | undefined;
    let lastValue: T | undefined = undefined;
    let silence = false;
    
    const unsub = orig.subscribe(value => {
      lastValue = value;
      if (!silence) {
        if (_config.leading) observer.next(value);
        silence = true;
        if (unsubSelected) unsubSelected();
        unsubSelected = durationSelector(value).subscribe(
          () => {
            silence = false;
            if (_config.trailing && lastValue) observer.next(lastValue); 
          }
        );
      } 
    });
    
    return () => {
      if (unsubSelected) unsubSelected();
      unsub();
    }
  });
}

/**
   Throttle a given Stream. This means that when the source emits new values, we wait for
   `ms`, discarding all values while waiting and then emit the last value.

   Equivalent to `rx.{@link throttle}(_ => rx.{@link timer}(<ms>)`.

   @example
   ```typescript
   rx.fromEvent(document, 'click').pipe(
     rx.throttle(100)
   ).subscribe(console.log);

   // will only print events *every 100 ms*
   ```

   @group Stream Operators

   @see {@link throttle}
   @see {@link debounceTime}
   @see https://web.archive.org/web/20220117092326/http://demo.nimius.net/debounce_throttle/
 */
export function throttleTime<T>(
  ms: number,
  config?: {
    leading?: boolean,
    trailing?: boolean,
  }
): OperatorFunction<T, T> {
  return orig => orig.pipe(throttle(_ => timer(ms), config));
}
