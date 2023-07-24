import Stream, { OperatorFunction } from "../stream";

/**
   Catch errors in a stream and switch to another observable.

   @example
   ```typescript
   rx.of([1, 2, 3, 4, 5])
     .pipe(
       rx.map(n => {
         if (n === 4) throw 'four!';
         return n;
       }),
       rx.catchError(_ => rx.of(['I', 'II', 'III', 'IV', 'V']))
     )
     .subscribe(x => console.log(x);

   // will print: 1, 2, 3, I, II, III, IV, V
   ```

   @group Stream Operators
 */
export default function catchError<T, O>(
  selector: ((err: any, caught: Stream<T>) => Stream<O>),
): OperatorFunction<T, T | O> {
  return orig => new Stream(observer => {

    let unsubSelected: () => void | undefined;

    const unsubOrig = orig.subscribe({
      ...observer,
      error(e) {
        const selected = selector(e, orig);
        if ((selected as any) === orig) {
          throw new Error(
            'Recursion in catchError is not supported. ' +
            'Please use the retry operator instead. \n\n' +
            'Example: \n\n' +
            "Don't: `.pipe(rx.catchError((_, caught) => caught))` \n" + 
            "Do: `.pipe(rx.retry())` \n"
          )
        } else {
          unsubSelected = selected.subscribe(observer);
        }
      }
    })

    return () => {
      if (unsubSelected !== undefined) unsubSelected();
      unsubOrig();
    }
  })
}
