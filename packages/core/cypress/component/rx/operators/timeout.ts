import { rx } from "$thispkg";
import { attempt, sleep } from "../../../support/helpers";

export const testTimeout = () => attempt(async () => {


  // first not timed out
  {
    const values: number[] = [];
    const unsub = rx.interval(50).pipe(rx.timeout(70)).subscribe(
      v => values.push(v)
    );
    await sleep(90);
    expect(values).to.deep.eq([0]);
    unsub();
  }

  // first timed out
  {
    const values: number[] = [];
    let isError = false;
    const unsub = rx.interval(50).pipe(rx.timeout(20)).subscribe({
      next: v => values.push(v),
      error() { isError = true; }
    });
    expect(isError).to.be.false;
    expect(values).to.deep.eq([]);
    await sleep(90);
    expect(isError).to.be.true;
    expect(values).to.deep.eq([0]);
    unsub();
  }

  // each timed out
  {
    const values: number[] = [];
    let isError = false;
    const unsub = rx.interval(50).pipe(rx.timeout(70, 20)).subscribe({
      next: v => values.push(v),
      error() { isError = true; }
    });
    expect(isError).to.be.false;
    expect(values).to.deep.eq([]);
    await sleep(90);
    expect(isError).to.be.true;
    expect(values).to.deep.eq([0]);
    unsub();
  }

  // each timed out second
  {
    const values: number[] = [];
    const state = new rx.State(0);
    let isError = false;
    const unsub = state.pipe(rx.timeout(Infinity, 50)).subscribe({
      next: v => values.push(v),
      error() { isError = true; }
    });
    state.next(1);
    expect(isError).to.be.false;
    expect(values).to.deep.eq([0, 1]);

    state.next(2);
    expect(isError).to.be.false;
    expect(values).to.deep.eq([0, 1, 2]);

    await sleep(90);
    expect(isError).to.be.true;
    expect(values).to.deep.eq([0, 1, 2]);
    unsub();
  }


})
