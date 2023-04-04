import { rx } from "$thispkg";
import { attempt, sleep } from "../../../support/helpers";

export const testTakeUntil = () => attempt(async () => {

  let values: number[] = [];

  rx.interval(50).pipe(
    rx.takeUntil(rx.timer(170))
  ).subscribe(v => values.push(v));

  await sleep(300);
  expect(values).to.deep.eq([0, 1, 2]);

});
