import { rx } from "$thispkg";
import { sleep } from "$thispkg/util/time";
import { attempt } from "../../../support/helpers";

export const testSwitchMap = () => attempt(async () => {

  // basic
  // ----------------------------------------------------------------------

  let values: number[] = [];
  rx.of([2, 3]).pipe(rx.switchMap(v => rx.of([v + 1, v + 2]))).subscribe(
    v => values.push(v)
  );

  expect(values).to.deep.eq([3, 4, 4, 5]);

  // basic async with cancellation
  // ----------------------------------------------------------------------

  let isFirst = true;
  async function firstTakesLonger(value: number) {
    if (isFirst) {
      isFirst = false;
      await sleep(200);
    }
    return value + 1;
  }

  values = [];
  let completed = false;
  const asyncMapped = rx.interval(50).pipe(
    rx.take(3),
    rx.switchMap(v => rx.from(firstTakesLonger(v))),
  );
  asyncMapped.subscribe({
    next: v => values.push(v),
    complete: () => completed = true,
  });
  
  await sleep(300);

  expect(values).to.deep.eq([2, 3])
  expect(completed).to.be.true;

});
