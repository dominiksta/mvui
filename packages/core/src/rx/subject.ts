import Observable, { Observer } from "./observable";

/**
 * An Observable that holds some modifiable state. Think of a "normal" Observable like a
 * dumb pipe, while a Subject is more like a 'source' to these pipes.
 * As a consequence, a Subject is instantiated with an initial value, you can inspect the
 * value with `.value` and you can change the value using `.next`, which will trigger all
 * subscriptions with the new value.
 */
export default class Subject<T> extends Observable<T> {

  private _value: T;
  /** The current value/state */
  get value() { return this._value }

  private observers: Observer<T>[] = [];

  constructor(initialValue: T) {
    super((_next) => undefined);
    this._value = initialValue;
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    this.observers.push(observer);

    try {
      observer.next(this._value);
    } catch(e) {
      observer.error(e);
    }

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

  /** Set a new value and trigger all subscriptions with that new value */
  next(value: T) {
    if (this.completed) return;
    this._value = value;
    for (let observer of this.observers) {
      observer.next(value);
    }
  }
  
}
