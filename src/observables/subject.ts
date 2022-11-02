import Observable from "./observable";

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

  private observers: ((value: T) => void)[] = [];

  constructor(initialValue: T) {
    super((_next) => undefined);
    this._value = initialValue;
  }

  protected _subscribe(observer: ((value: T) => void)) {
    this.observers.push(observer);
    observer(this._value);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) this.observers.splice(index, 1);
    }
  }

  /** Completing a subject just means clearing all its subscriptions. */
  complete() { this.observers = []; }

  /** Set a new value and trigger all subscriptions with that new value */
  next(value: T) {
    this._value = value;
    for (let observer of this.observers) {
      observer(value);
    }
  }
  
}
