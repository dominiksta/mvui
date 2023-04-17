import ReplayStream from "../replay-stream";
import MulticastStream from "../multicast-stream";
import Stream, { OperatorFunction } from "../stream";

export interface ShareConfig<T> {
  /**
     The MulticastStream object to use as the base. You will most likely not use this much
     and instead use the small wrapper function {@link shareReplay}.
   */
  connector?: () => MulticastStream<T>;
  /**
     Wether to reset the stream when all observers have unsubscribed.
   */
  resetOnRefCountZero?: boolean;
  /**
     Wether to reset the stream when the original stream completed.
   */
  resetOnComplete?: boolean;
  /**
     Wether to reset the stream when an error occured in the original stream.
   */
  resetOnError?: boolean;
}

/**
   Share a Stream, such that multiple subscribers will subscribe to the same underlying
   Stream. On a basic level, one can think of the `share` operator as transforming a
   Stream to a {@link MulticastStream} (which see for more explanations).

   ### Example

   ```typescript
   const s = rx.interval(100).pipe(
     rx.delay(500),
     rx.share(),
   );

   s.subscribe(v => console.log('subscription 1: ', v));
   await sleep(1000);

   // logs:
   // [nothing for 600ms]
   // subscriber 1: 0
   // [nothing for 100ms]
   // subscriber 1: 1
   // [nothing for 100ms]
   // subscriber 1: 2
   // [nothing for 100ms]

   s.subscribe(v => console.log('subscription 2: ', v));

   // logs:
   // subscriber 1: 3
   // subscriber 2: 3
   // [nothing for 100ms]
   // subscriber 1: 4
   // subscriber 2: 4
   // ...

   // notice how there is no delay after subscribing for a second time. without the
   // `share` operator, there would have been.
   ```
 */
export default function share<T>(options?: ShareConfig<T>): OperatorFunction<T, T> {
  const _options = {
    connector: () => new MulticastStream<T>(),
    resetOnRefCountZero: true,
    resetOnComplete: true,
    resetOnError: true,
    ...options,
  }

  let refCount = 0;

  let mc: MulticastStream<T> | undefined = _options.connector();
  let unsubOrig: (() => void) | undefined = undefined;

  const reset = () => {
    mc = undefined;
    unsubOrig && unsubOrig();
    unsubOrig = undefined;
  };

  return orig => {
    return new Stream(observer => {
      refCount++;

      mc = mc ?? _options.connector();
      const dest = mc!;

      if (!unsubOrig) unsubOrig = orig.subscribe({
        next(v) { dest.next(v) },
        error(v) {
          if (_options.resetOnError) reset();
          dest.error(v);
        },
        complete() {
          // console.debug('share: orig complete');
          if (_options.resetOnComplete) reset();
          dest.complete();
        },
      });

      const unsubDest = mc.subscribe(observer);

      return () => {
        refCount--;
        if (_options.resetOnRefCountZero && refCount === 0 && unsubOrig) {
          reset();
        }
          
        unsubDest();
      };
    })
  };
}

export interface ShareReplayConfig {
  /**
     How many previous emissions should be replayed (Defaults to *Infinity*).
   */
  bufferSize?: number;
  /**
     Previous emissions older then this will be discarded (Defaults to *Infinity*).
   */
  windowTime?: number;
  /**
     Wether to reset the stream when all observers have unsubscribed.
   */
  refCount?: boolean;
}

/**
   Very similar to {@link share}, but `resetOnRefCountZero` is false by default and
   previous emissions will be replayed for new subscribers.

   ### Relation to share

   This is the entire source code for shareReplay:

   ```typescript
   export function shareReplay<T>(options?: ShareReplayConfig): OperatorFunction<T, T> {
     const _options = {
       bufferSize: Infinity, windowTime: Infinity, refCount: false,
       ...options,
     };
   
     return share<T>({
       connector: () => new ReplayStream(_options.bufferSize, _options.windowTime),
       resetOnError: true,
       resetOnComplete: false,
       resetOnRefCountZero: _options.refCount,
     });
   }
   ```

   @example
   ```typescript
   const s = rx.interval(50).pipe(
     rx.tap(_ => { count++; }),
     rx.shareReplay({ bufferSize: 10 }),
   );

   s.subscribe(v => console.log('subscription 1: ', v));
   await sleep(160);

   // logs:
   // [nothing for 50ms]
   // subscription 1: 0
   // [nothing for 50ms]
   // subscription 1: 1
   // [nothing for 50ms]
   // subscription 1: 2

   s.subscribe(v => console.log('subscription 2: ', v));

   // logs:
   // subscription 2: 0
   // subscription 2: 1
   // subscription 2: 2
   // [nothing for 50ms]
   // subscription 1: 3
   // subscription 2: 3
   // [nothing for 50ms]
   // subscription 1: 4
   // subscription 2: 4
   // ...
   ```
 */
export function shareReplay<T>(options?: ShareReplayConfig): OperatorFunction<T, T> {
  const _options = {
    bufferSize: Infinity, windowTime: Infinity, refCount: false,
    ...options,
  };

  return share<T>({
    connector: () => new ReplayStream(_options.bufferSize, _options.windowTime),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: _options.refCount,
  });
}
