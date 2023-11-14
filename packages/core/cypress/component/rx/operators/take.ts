import { rx } from "$thispkg";
import { attempt } from "../../../support/helpers";

export const testTake = () => attempt(() => {

  // basic
  // ----------------------------------------------------------------------

  let values: number[] = [];
  rx.of(2, 3, 4, 5, 6).pipe(rx.take(2)).subscribe(
    v => values.push(v)
  );

  expect(values).to.deep.eq([2, 3]);

  // complete before errors
  // ----------------------------------------------------------------------

  values = [];
  rx.of(2, 3, 4, 5, 6).pipe(
    rx.map(n => { if (n > 3) throw 'three!'; else return n; }),
    rx.take(2),
  ).subscribe(
    v => values.push(v)
  );

  expect(values).to.deep.eq([2, 3]);

  values = [];
  rx.of(2, 3, 4, 5, 6).pipe(
    rx.take(2),
    rx.map(n => { if (n > 3) throw 'three!'; else return n; }),
  ).subscribe(
    v => values.push(v)
  );

  expect(values).to.deep.eq([2, 3]);

});
