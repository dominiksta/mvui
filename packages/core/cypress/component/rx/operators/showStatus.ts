import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testShowStatus = () => attempt(async () => {

  let values: { waiting: boolean, value?: number }[] = [];
  let error = false;

  const s = rx.interval(200).pipe(
    rx.showStatus(
      rx.pipe(
        rx.switchMap(_ => rx.of(0).pipe(
          rx.delay(100),
          rx.tap(_ => { if (error) throw new Error('hi') }),
        )),
        rx.map(v => v + 1)
      )),
  );

  let unsub = s.subscribe({
    next: v => values.push({ waiting: v.waiting, value: v.value }),
    error: console.warn,
  });

  expect(values).to.deep.eq([]);

  await sleep(230); // total: 230
  expect(values).to.deep.eq([
    { waiting: true, value: undefined },
  ]);

  await sleep(100); // total: 330
  expect(values).to.deep.eq([
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
  ]);

  await sleep(100); // total: 430
  expect(values).to.deep.eq([
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
    { waiting: true , value: undefined },
  ]);

  await sleep(100); // total: 530
  expect(values).to.deep.eq([
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
  ]);

  await sleep(100); // total: 630
  expect(values).to.deep.eq([
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
    { waiting: true , value: undefined },
    { waiting: false, value: 1 },
    { waiting: true , value: undefined },
  ]);

  unsub();

  let values2: any[] = [];

  unsub = s.pipe(
    rx.handleStatus({
      success: v => v,
      waiting: () => 'waiting',
      failure: e => e.message,
    })
  ).subscribe({
    next: v => values2.push(v),
  });

  expect(values2).to.deep.eq([]);

  await sleep(230); // total: 230
  expect(values2).to.deep.eq([
    'waiting',
  ]);

  await sleep(100); // total: 330
  expect(values2.slice(0, 2)).to.deep.eq([
    'waiting', 1
  ]);

  error = true;
  await sleep(100); // total: 430
  expect(values2.slice(0, 3)).to.deep.eq([
    'waiting', 1, 'waiting'
  ]);

  await sleep(100); // total: 530
  expect(values2.slice(0, 4)).to.deep.eq([
    'waiting', 1, 'waiting', 'hi'
  ]);

  await sleep(100); // total: 630
  expect(values2.slice(0, 5)).to.deep.eq([
    'waiting', 1, 'waiting', 'hi', 'waiting'
  ]);
  
  await sleep(100); // total: 730
  expect(values2.slice(0, 6)).to.deep.eq([
    'waiting', 1, 'waiting', 'hi', 'waiting', 'hi'
  ]);
  
  unsub();
});
