import { rx } from '$thispkg';
import { attempt } from '../../../support/helpers';

export const testRetry = () => attempt(() => {

  const s = new rx.Stream<number>(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    throw new Error('hi');
    observer.next(4);
  });

  let values: number[] = [];
  s.pipe(
    rx.retry(5),
    rx.catchError(_ => rx.of([ 1337 ]))
  ).subscribe(v => values.push(v));

  expect(values).to.deep.eq([
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1, 2, 3,
    1337
  ]);

});
