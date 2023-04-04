import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testStartWith = () => attempt(async () => {

  let values: number[] = [];

  rx.interval(100).pipe(
    rx.startWith(2)
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([2]);
  await sleep(110);
  expect(values).to.deep.eq([2, 0]);
  await sleep(110);
  expect(values).to.deep.eq([2, 0, 1]);

});
