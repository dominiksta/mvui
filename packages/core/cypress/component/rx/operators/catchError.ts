import { rx } from "$thispkg";
import { attempt } from "../../../support/helpers";

export const testCatchError = () => attempt(() => {
  let values: (string | number)[] = [];

  rx.of([1, 2, 3, 4, 5])
    .pipe(
      rx.map(n => {
        if (n === 4) throw 'four!';
        return n;
      }),
      rx.catchError(_ => rx.of(['I', 'II', 'III', 'IV', 'V']))
    )
    .subscribe(x => values.push(x));

  expect(values).to.deep.eq([1, 2, 3, 'I', 'II', 'III', 'IV', 'V'])

  // error in returned stream
  // ----------------------------------------------------------------------

  values = [];

  rx.of([1, 2, 3, 4, 5])
    .pipe(
      rx.map(n => {
        if (n === 4) throw 'four!';
        return n;
      }),
      rx.catchError(() => rx.of(['I', 'II']).pipe(
        rx.map(n => {
          if (n === 'II') throw 'error in returned stream';
          else return n;
        })
      )),
      rx.catchError(() => rx.of(['yes']))
    )
    .subscribe(v => values.push(v));

  expect(values).to.deep.eq([1, 2, 3, 'I', 'yes']);

});

