import { rx } from "$thispkg";
import { sleep } from "../../support/helpers";

describe('stream sharing', () => {
  it('share with refCount', async () => {
    let count = 0;
    const s = rx.interval(50).pipe(
      rx.tap(_ => count++),
      rx.share(),
    );

    const values1: number[] = [];
    const values2: number[] = [];

    let unsub1 = s.subscribe(v => values1.push(v));
    let unsub2 = s.subscribe(v => values2.push(v));

    await sleep(210);

    expect(values1).to.deep.eq([0, 1, 2, 3]);
    expect(values2).to.deep.eq([0, 1, 2, 3]);
    expect(count).to.eq(4);

    unsub1();
    await sleep(50);
    expect(count).to.eq(5);

    unsub2();
    await sleep(50);
    expect(count, 'cold after all have unsubscribed').to.eq(5);

    unsub1 = s.subscribe(v => values1.push(v));
    unsub2 = s.subscribe(v => values2.push(v));

    await sleep(210);

    expect(
      values1, 'reset after all have unsubscribed'
    ).to.deep.eq([0, 1, 2, 3, 0, 1, 2, 3]);
    expect(values2).to.deep.eq([0, 1, 2, 3, 4, 0, 1, 2, 3]);
    expect(count).to.eq(9);

    unsub1();
    await sleep(50);
    expect(count).to.eq(10);

    unsub2();
    await sleep(20);
    expect(count).to.eq(10);

  });

  it('share without refCount', async () => {
    let count = 0;
    const s = rx.interval(50).pipe(
      rx.tap(_ => count++),
      rx.share({ resetOnRefCountZero: false }),
    );

    const values1: number[] = [];
    const values2: number[] = [];

    let unsub1 = s.subscribe(v => values1.push(v));
    let unsub2 = s.subscribe(v => values2.push(v));

    await sleep(210);

    expect(values1).to.deep.eq([0, 1, 2, 3]);
    expect(values2).to.deep.eq([0, 1, 2, 3]);
    expect(count).to.eq(4);

    unsub1();
    await sleep(50);
    expect(count).to.eq(5);

    unsub2();
    await sleep(50);
    expect(count, 'hot after all have unsubscribed').to.eq(6);

    unsub1 = s.subscribe(v => values1.push(v));
    unsub2 = s.subscribe(v => values2.push(v));

    await sleep(210);

    expect(
      values1, 'no reset after all have unsubscribed'
    ).to.deep.eq([0, 1, 2, 3, 6, 7, 8, 9]);
    expect(values2).to.deep.eq([0, 1, 2, 3, 4, 6, 7, 8, 9]);
    expect(count).to.eq(10);

    unsub1();
    await sleep(50);
    expect(count).to.eq(11);

    unsub2();
    await sleep(50);
    expect(count).to.eq(12);

  });

  it('share with resetOnComplete', async () => {
    let count = 0;
    const s = rx.timer(50).pipe(
      rx.tap(_ => count++),
      rx.share(),
    );

    const unsub1 = s.subscribe();
    await sleep(60);
    expect(count).to.eq(1);

    // subscribe after first has completed
    const unsub2 = s.subscribe();
    await sleep(60);
    expect(count).to.eq(2);

    unsub1(); unsub2();
  });

  it('share without resetOnComplete', async () => {
    let count = 0;
    const s = rx.timer(50).pipe(
      rx.tap(_ => count++),
      rx.share({ resetOnComplete: false }),
    );

    s.subscribe();
    await sleep(60);
    expect(count).to.eq(1);

    // subscribe after first has completed
    s.subscribe();
    await sleep(60);
    expect(count).to.eq(1);
  });

  it('share with resetOnError', async () => {
    let count = 0;
    const s = rx.interval(50).pipe(
      rx.tap(v => {
        if (v === 3) throw new Error('err 3');
        count++;
      }),
      rx.share(),
    );

    let values: number[] = [];

    const unsub1 = s.subscribe({ error() { }, next(v) { values.push(v); } });
    await sleep(210);
    expect(count).to.eq(3);
    expect(values).to.deep.eq([0, 1, 2]);

    // subscribe after error
    const unsub2 = s.subscribe({ error() { }, next(v) { values.push(v); } });
    await sleep(210);
    expect(count).to.eq(6);
    expect(values).to.deep.eq([0, 1, 2, 0, 1, 2]);

    unsub1(); unsub2();
  });

  it('shareReplay', async () => {
    let count = 0;
    const s = rx.interval(50).pipe(
      rx.tap(_ => { count++; }),
      rx.shareReplay(),
    );

    let values1: number[] = [];
    let values2: number[] = [];
    let values3: number[] = [];

    const unsub1 = s.subscribe(v => values1.push(v));
    await sleep(210);
    expect(count).to.eq(4);
    expect(values1).to.deep.eq([0, 1, 2, 3]);

    const unsub2 = s.subscribe(v => values2.push(v));
    await sleep(210);
    expect(count).to.eq(8);
    expect(values1).to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(values2, 'values were replayed').to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7]);

    unsub1(); unsub2();

    const unsub3 = s.subscribe(v => values3.push(v));
    await sleep(50);
    expect(count).to.eq(9);
    expect(values1, 'unsub did not change').to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(values2, 'unsub did not change').to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(
      values3, 'values were replayed even after all have unsubscribed'
    ).to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7, 8]);

    unsub3();
  });
})
