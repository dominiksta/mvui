import Stream, { OperatorFunction } from "../stream";

function debounce<T extends Function>(
  this: any, func: T, timeout = 300
): T {
  let timer: any;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  }) as any;
}

/**
 * TODO
 */
export default function debounceTime<T>(
  ms: number, emitFirst: false,
): OperatorFunction<T, T> {

  return orig => new Stream(observer => {
    let timer: any;
    let isFirst = true;

    const unsub = orig.subscribe(value => {
      if (emitFirst && isFirst) {
        isFirst = false; observer.next(value); return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => { observer.next(value); }, ms);
    });

    return () => {
      clearTimeout(timer);
      unsub();
    }
  });
}
