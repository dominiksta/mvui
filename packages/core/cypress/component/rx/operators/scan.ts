import { rx } from '$thispkg';
import { OperatorFunction } from '$thispkg/rx/stream';
import { attempt } from '../../../support/helpers';

export const testScan = () => attempt(() => {

  let values: number[] = [];

  rx.of(1, 2, 3, 4).pipe(
    rx.scan((acc, curr) => acc + curr)
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([1, 3, 6, 10]);

  values = [];
  rx.of(1, 2, 3, 4).pipe(
    rx.scan((acc, curr) => acc + curr, 2)
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([3, 5, 8, 12]);

});
