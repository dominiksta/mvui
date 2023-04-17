import { Observer } from "./interface";
import MulticastStream from "./multicast-stream";

/**
   Like {@link MulticastStream}, but it replays its values according to the specified
   `_bufferSize` and `_windowSize`.

   @see {@link shareReplay}
 */
export default class ReplayStream<T> extends MulticastStream<T> {
  private _buffer: T[] = [];
  private _timestamps: number[] = [];

  constructor(
    private _bufferSize = Infinity,
    private _windowTime = Infinity,
  ) {
    super();
    this._bufferSize = Math.max(1, _bufferSize);
    this._windowTime = Math.max(1, _windowTime);
  }

  override next(value: T): void {
    if (this.completed) return;

    this._buffer.push(value);
    this._timestamps.push(Date.now());

    this._trimBuffer();
    super.next(value);
  }

  protected override _subscribe(observer: Observer<T>) {
    this._trimBuffer();
    for (const el of this._buffer) observer.next(el)
    return super._subscribe(observer);
  }

  private _trimBuffer() {
    if (this._buffer.length > this._bufferSize) {
      const diff = this._buffer.length - this._bufferSize
      this._buffer.splice(0, diff);
      this._timestamps.splice(0, diff);
    }
    if (this._windowTime !== Infinity) {
      const now = Date.now();
      let last = 0;
      while (this._timestamps[last] < now - this._windowTime) last++;
      if (last !== 0) {
        this._buffer.splice(0, last);
        this._timestamps.splice(0, last);
      }
    }
  }
  
}
