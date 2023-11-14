import { rx } from '$thispkg';
import { attempt, sleep } from '../../../support/helpers';

export const testLast = () => attempt(async () => {
  // no default
  {
    let val = 0;
    rx.of(3, 2, 5).pipe(rx.last(-2)).subscribe(v => val = v);
    expect(val).to.eq(5);
  }

  // default
  {
    let val = 0;
    rx.of().pipe(rx.last(-2)).subscribe(v => val = v);
    expect(val).to.eq(-2);
  }

  // error
  {
    let val = 0, hasError = false;
    rx.of().pipe(rx.last()).subscribe({
      next(v) { val = v; },
      error(e) { hasError = true; expect(e).to.be.instanceof(rx.EmptyError) },
    });
    expect(val).to.eq(0);
    expect(hasError).to.be.true;
  }
})

export const testFirst = () => attempt(async () => {
  // no default
  {
    let val = 0;
    rx.of(3, 2, 5).pipe(rx.first(-1)).subscribe(v => val = v);
    expect(val).to.eq(3);
  }

  // default
  {
    let val = 0;
    rx.of().pipe(rx.first(-2)).subscribe(v => val = v);
    expect(val).to.eq(-2);
  }

  // error
  {
    let val = 0, hasError = false;
    rx.of().pipe(rx.first()).subscribe({
      next(v) { val = v; },
      error(e) { hasError = true; expect(e).to.be.instanceof(rx.EmptyError) },
    });
    expect(val).to.eq(0);
    expect(hasError).to.be.true;
  }
})

export const testDefaultIfEmpty = () => attempt(async () => {
  // empty
  {
    let val = 0;
    rx.of().pipe(rx.defaultIfEmpty(-2)).subscribe(v => val = v);
    expect(val).to.eq(-2);
  }

  // not empty
  {
    let vals: number[] = [];
    rx.of(5, 6).pipe(rx.defaultIfEmpty(-2)).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([5, 6]);
  }
})

export const testFind = () => attempt(async () => {
  // found
  {
    let vals: number[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.find(v => v > 5), rx.map(v => v ?? -1)
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([6]);
  }

  // not found
  {
    let vals: number[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.find(v => v > 10), rx.map(v => v ?? -1)
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([-1]);
  }
})

export const testFindIndex = () => attempt(async () => {
  // found
  {
    let vals: number[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.findIndex(v => v > 5), rx.map(v => v ?? -1)
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([1]);
  }

  // not found
  {
    let vals: number[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.findIndex(v => v > 10), rx.map(v => v ?? -1)
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([-1]);
  }
})

export const testToArray = () => attempt(async () => {
  let vals: number[] = [];
  rx.of(5, 6, 7, 3).pipe(
    rx.toArray(),
  ).subscribe(v => vals = v);
  expect(vals).to.deep.eq([5, 6, 7, 3]);
})

export const testEvery = () => attempt(async () => {
  // not every
  {
    let vals: boolean[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.every(v => v > 5),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([false]);
  }

  // every
  {
    let vals: boolean[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.every(v => v > 2),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([true]);
  }
})

export const testCount = () => attempt(async () => {
  // not empty
  {
    let vals: number[] = [];
    rx.of(5, 6, 7, 3).pipe(
      rx.count(),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([4]);
  }

  // empty
  {
    let vals: number[] = [];
    rx.of().pipe(
      rx.count(),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([0]);
  }
})

export const testIsEmpty = () => attempt(async () => {
  // empty
  {
    let vals: boolean[] = [];
    rx.of().pipe(
      rx.isEmpty(),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([true]);
  }

  // not empty
  {
    let vals: boolean[] = [];
    rx.of(1).pipe(
      rx.isEmpty(),
    ).subscribe(v => vals.push(v));
    expect(vals).to.deep.eq([false]);
  }
})
