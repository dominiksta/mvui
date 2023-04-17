import Stream, { OperatorFunction } from "../stream";

/**
 * TODO

   @group Stream Operators
 */
export default function skip<T>(
  count: number
): OperatorFunction<T, T> {
  return orig => new Stream(observer => {
    let skipped = 0;
    return orig.subscribe(v => {
      skipped++;
      if (skipped > count) observer.next(v);
    })
  })
}
