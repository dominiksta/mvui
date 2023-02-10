import { Observer } from "./observable";
import Subject from "./subject";

/**
 * A {@link Subject} that remembers the last emitted value. Useful to model state.
 *
 * @example
 * ```typescript
 * const subj$ = new BehaviourSubject(1);
 * subj$.map(v => v + 1).subscribe(console.log);
 *
 * subj$.next(4); subj.next(3);
 *
 * // Logs: 2 5 4
 *
 * // The difference to a normal Subject is that we provide an initial value
 * // and we could always access the current value with `.value`.
 * ```
 */
export default class BehaviourSubject<T> extends Subject<T> {

  private _value: T;
  /** The current value/state */
  get value() { return this._value }

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  /** @ignore */
  protected override _subscribe(observer: Observer<T>) {
    try {
      observer.next(this._value);
    } catch(e) {
      observer.error(e);
    }

    return super._subscribe(observer);
  }

  /** Set a new value and trigger all subscriptions with that new value */
  override next(value: T) {
    if (this.completed) return;
    this._value = value;
    super.next(value);
  }
}
