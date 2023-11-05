import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testMergeWith = () => attempt(async () => {
    const ones = rx.interval(50).pipe(rx.map(() => 1), rx.take(3));
    const twos = rx.interval(50).pipe(rx.map(() => 2), rx.take(3));
    const threes = rx.interval(50).pipe(rx.map(() => 3), rx.take(3));

    const vals: number[] = [];
    let isComplete = false;
    ones.pipe(
      rx.mergeWith(
        twos.pipe(rx.delay(10)),
        threes.pipe(rx.delay(20)),
      )
    ).subscribe({
      next: v => vals.push(v),
      complete: () => isComplete = true,
    });
    await sleep(200);
    expect(vals).to.deep.eq([1, 2, 3, 1, 2, 3, 1, 2, 3])
    expect(isComplete).to.be.true;
})
