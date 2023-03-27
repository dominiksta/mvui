import Stream, { Observer } from "./stream";

/**
   A {@link Stream} that is *multicast*. A normal Stream is *unicast* in the sense that
   each time you call `.subscribe`, a new stream is created and torn down upon completion
   or after calling `.unsubscribe`. Additionally, a MulticastStream also allows you to
   `.next` a new value into the stream from "outside".

   @example
   ```typescript
   // multicast: simple
   // ----------------------------------------------------------------------

   const mc = new MulticastStream<number>();

   mc.subscribe(v => console.log(`Observer A: ${v}`));
   mc.subscribe(v => console.log(`Observer B: ${v}`));

   mc.next(1); mc.next(2);

   // Logs:
   // Observer A: 1
   // Observer B: 1
   // Observer A: 2
   // Observer B: 2

   // Each new value is seen by *both observers*, that is why it is
   // called multicast.

   // multicast: using a MulticastStream as an Observer
   // ----------------------------------------------------------------------

   const obs = new Stream<number>(observer => {
     observer.next(1); observer.next(2);
   });

   const mc = new MulticastStream<number>();

   mc.subscribe(v => console.log(`Observer A: ${v}`));
   mc.subscribe(v => console.log(`Observer B: ${v}`));

   obs.subscribe(mc);

   // Same log output as above
   ```
 */
export default class MulticastStream<T> extends Stream<T> implements Observer<T> {

  protected completed = false;
  protected observers: Observer<T>[] = [];

  constructor() {
    super((_observer) => undefined);
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    this.observers.push(observer);

    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) this.observers.splice(index, 1);
    }
  }

  /** Completing a MulticastStream just means clearing all its subscriptions. */
  complete() {
    if (this.completed) throw new Error('MulticastStream was already completed');
    this.completed = true;
    for (let observer of this.observers) observer.complete();
    this.observers = [];
  }

  error(err: any) {
    if (this.completed) return;
    for (let observer of this.observers) observer.error(err);
  }

  /** Trigger all subscriptions with the given value */
  next(value: T) {
    if (this.completed) return;
    for (let observer of this.observers) observer.next(value);
  }

}
