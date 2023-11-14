import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testRetry = () => attempt(async () => {

  // resetOnsuccess: false
  // ----------------------------------------------------------------------

  const s = new rx.Stream<number>(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    throw new Error('hi');
    observer.next(4);
  });

  let values: number[] = [];
  s.pipe(
    rx.retry(4),
    rx.catchError(_ => rx.of(1337))
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1337
  ]);

  // resetOnsuccess: true
  // ----------------------------------------------------------------------

  values = [];
  s.pipe(
    rx.retry(4, { resetOnSuccess: true }),
    rx.catchError(_ => rx.of(1337)),
    rx.take(18),
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
  ]);

  // delay
  // ----------------------------------------------------------------------

  values = [];
  s.pipe(
    rx.retry(1, { delay: 100 }),
    rx.catchError(_ => rx.of(1337)),
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([
    1, 2, 3,
  ]);

  await sleep(110);

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
    1337
  ]);

  // delay as conditional abort
  // ----------------------------------------------------------------------

  values = [];
  s.pipe(
    rx.retry(Infinity, {
      delay: () =>
        values.length > 7 ? rx.throwError(new Error('yes')) : rx.timer(100),
    }),
    rx.catchError(_ => rx.of(1337)),
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([
    1, 2, 3,
  ]);

  await sleep(110);

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
  ]);

  await sleep(110);

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1337
  ]);

});
