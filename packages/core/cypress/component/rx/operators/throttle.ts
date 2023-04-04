import { rx } from "$thispkg";
import { attempt, sleep } from "../../../support/helpers";

export const testThrottle = () => attempt(async () => {

  // time: leading
  // ----------------------------------------------------------------------

  let values: number[] = [];

  let state = new rx.State(0);

  let unsub = state.pipe(rx.throttleTime(100)).subscribe(v => values.push(v));
  
  expect(values).to.deep.eq([0]);
  
  state.next(1); state.next(2); state.next(3);
  await sleep(110);
  expect(values).to.deep.eq([0]);
  state.next(4);
  expect(values).to.deep.eq([0, 4]);

  
  // time: trailing
  // ----------------------------------------------------------------------

  await sleep(110);
  values = [];
  unsub();
  state.next(0);
  unsub = state.pipe(rx.throttleTime(100, {
    leading: false, trailing: true
  })).subscribe(v => values.push(v));

  expect(values).to.deep.eq([]);

  state.next(1); state.next(2); state.next(3);
  expect(values).to.deep.eq([]);
  await sleep(110);
  expect(values).to.deep.eq([3]);
  state.next(4);
  expect(values).to.deep.eq([3]);
  state.next(5);
  expect(values).to.deep.eq([3]);
  await sleep(110);
  expect(values).to.deep.eq([3, 5]);
  
});
