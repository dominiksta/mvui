import { Observer } from "./stream";
import MulticastStream from "./multicast-stream";
import Selector from "./selector";

/**
 * A {@link MulticastStream} that remembers the last emitted value. Useful to model state.
 *
 * @example
 * ```typescript
 * const state$ = new State(1);
 * state$.map(v => v + 1).subscribe(console.log);
 *
 * state$.next(4); state$.next(3);
 *
 * // Logs: 2 5 4
 *
 * // The difference to a normal Subject is that we provide an initial value
 * // and we could always access the current value with `.value`.
 * ```
 */
export default class State<T> extends MulticastStream<T> {

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

  /** Shorthand for `{@link Selector.create}(this, definition)` */
  select<ReturnT>(definition: (value: T) => ReturnT): Selector<ReturnT> {
    return Selector.create(this, definition);
  }
}
