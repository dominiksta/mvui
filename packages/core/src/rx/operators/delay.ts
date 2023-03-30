import Stream, { OperatorFunction } from "../stream";

/**
   Delay all emissions according to `due` (either in relative milliseconds or an absolute
   Date).
 */
export default function delay<T>(due: number | Date): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    const _delay = (cb: Function) => {
      setTimeout(() => {
        cb();
      }, due instanceof Date ? (due.getTime() - Date.now()) : due);
    }
    orig.subscribe({
      error: e => _delay(() => observer.error(e)),
      complete: () => _delay(() => observer.complete()),
      next: v => _delay(() => observer.next(v)),
    })
  });
}
