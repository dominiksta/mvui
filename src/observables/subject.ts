import Observable from "./observable";

export default class Subject<T> extends Observable<T> {

  private _value: T;
  get value() { return this._value }

  private subscriptions: ((value: T) => void)[] = [];

  constructor(initialValue: T) {
    super(() => null);
    this._value = initialValue;
  }

  override subscribe(subscription: ((value: T) => void)) {
    this.subscriptions.push(subscription);
    subscription(this._value);
  }

  next(value: T) {
    this._value = value;
    for (let subscription of this.subscriptions) {
      subscription(value);
    }
  }
  
}
