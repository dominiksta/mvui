import { rx } from "$thispkg";
import { attempt, sleep } from "../../../support/helpers";

export const testErrorInChain = () => attempt(async () => {

  let count = 0;
  const s = rx.interval(20).pipe(
    rx.tap(v => {
      if (v === 3) throw new Error('err 3');
      count++;
    }),
  );

  let error!: Error;
  s.subscribe({ error(e) { error = e } });
  await sleep(90);
  expect(count).to.eq(3);
  expect(error && error.message).to.eq('err 3');

});
