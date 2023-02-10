import Observable, { Observer } from "./observable";

/**
   An {@link Observable} that is *multicast*. A normal observable is *unicast* in the
   sense that each time you call `.subscribe`, a new stream is created and torn down upon
   completion or after calling `.unsubscribe`. Additionally, a Subject also allows you to
   `.next` a new value into the stream from "outside".

   @example
   ```typescript
   // multicast: simple
   // ----------------------------------------------------------------------

   const subject = new Subject<number>();

   subject.subscribe(v => console.log(`Observer A: ${v}`));
   subject.subscribe(v => console.log(`Observer B: ${v}`));

   subject.next(1); subject.next(2);

   // Logs:
   // Observer A: 1
   // Observer B: 1
   // Observer A: 2
   // Observer B: 2

   // Each new value is seen by *both observers*, that is why it is
   // called multicast.

   // multicast: using a subject as an observer
   // ----------------------------------------------------------------------

   const obs = new Observable<number>(observer => {
     observer.next(1); observer.next(2);
   });

   const subject = new Subject<number>();

   subject.subscribe(v => console.log(`Observer A: ${v}`));
   subject.subscribe(v => console.log(`Observer B: ${v}`));

   obs.subscribe(subject);

   // Same log output as above
   ```
 */
export default class Subject<T> extends Observable<T> implements Observer<T> {

  private observers: Observer<T>[] = [];

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

  /** Completing a subject just means clearing all its subscriptions. */
  complete() {
    if (this.completed) throw new Error('Subject was already completed');
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
