import { rx } from '$thispkg';
import { sleep } from '$thispkg/util/time';
import { attempt } from "../../support/helpers";
import * as rxjs from 'rxjs';

describe('rxjs interop', () => {
  it('sync mvui to rxjs', () => {
    let res = 0;

    const hi = rxjs.from(rx.of([0, 1, 2])).pipe(
      rxjs.map(v => v + 1),
      rxjs.tap(v => res = v),
    );
    hi.subscribe();

    expect(res).to.eq(3);

  }),

  it('sync rxjs to mvui', () => {
    let res = 0;

    const hi = rx.from(rxjs.of(0, 1, 2)).pipe(
      rx.map(v => v + 1),
      rx.tap(v => res = v),
    );
    hi.subscribe();

    expect(res).to.eq(3);

  })

  it('async mvui to rxjs switchMap', attempt(async () => {
    let isFirst = true;
    async function firstTakesLonger(value: number) {
      if (isFirst) { isFirst = false; await sleep(200); }
      return value + 1;
    }

    let values: number[] = [];
    let completed = false;
    const asyncMapped = rxjs.from(rx.interval(50)).pipe(
      rxjs.take(3),
      rxjs.switchMap(v => rxjs.from(firstTakesLonger(v))),
    );

    asyncMapped.subscribe({
      next: v => values.push(v),
      complete: () => completed = true,
    });

    await sleep(300);

    expect(asyncMapped).to.be.instanceof(rxjs.Observable);
    expect(values).to.deep.eq([2, 3])
    expect(completed).to.be.true;
  }))
});


