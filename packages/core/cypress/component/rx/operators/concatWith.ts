import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testConcatWith = () => attempt(async () => {
    const ones = rx.interval(10).pipe(rx.map(() => 1), rx.take(3));
    const twos = rx.interval(10).pipe(rx.map(() => 2), rx.take(3));
    const threes = rx.interval(10).pipe(rx.map(() => 3), rx.take(3));

    const vals: number[] = [];
    let isComplete = false;
    ones.pipe(
      rx.concatWith(twos, threes)
    ).subscribe({
      next: v => vals.push(v),
      complete: () => isComplete = true,
    });
    await sleep(150);
    expect(vals).to.deep.eq([1, 1, 1, 2, 2, 2, 3, 3, 3])
    expect(isComplete).to.be.true;
})
