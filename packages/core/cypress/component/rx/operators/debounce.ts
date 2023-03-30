import { rx } from "$thispkg";
import { attempt, sleep } from "../../../support/helpers";

export const testDebounce = () => attempt(async () => {

  let count = 0;

  let state = new rx.State(0);

  state.pipe(rx.debounceTime(100)).subscribe(_ => count++);

  expect(count).to.be.eq(0);
  await sleep(110);
  expect(count).to.be.eq(1);
  state.next(1); state.next(2); state.next(3);
  expect(count).to.be.eq(1);
  await sleep(110);
  expect(count).to.be.eq(2);
  
});
