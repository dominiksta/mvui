import { test, expect } from '@jest/globals';
import { arrayCompare } from 'util/datastructure';
import { OperatorFunction } from 'rx/stream';
import { pipe } from 'rx/util';
import { filter, map } from 'rx/operators';
import { State, Stream } from 'rx';
import { sleep } from 'util/time';


test('subscribing to a synchronous definition returns the correct result', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [1, 2, 3])).toBeTruthy();
})

test('completion', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1);
    observer.next(2);
    observer.complete();
    observer.next(3);
  })

  let result: number[] = [];
  let completed = false;
  obs$.map(v => v + 1).subscribe({
    next(v) { result.push(v); },
    error(e) { console.log('e'); },
    complete() { completed = true; }
  });

  expect(completed).toBeTruthy();
  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
})

test('error handling', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1);
    observer.next(2);
    // note that if we threw in a setTimeout here, the error would not be caught. while
    // maybe unintuitive, this is actually also how it works in rxjs
    throw new Error('hi');
    // observer.complete();
    observer.next(3);
  })

  let result: number[] = [];
  let calledError = false;

  obs$.map(v => v + 1).subscribe({
    next(v) { result.push(v) },
    error(e) {
      calledError = true;
      expect(e instanceof Error).toBeTruthy();
      expect(e.message).toBe('hi');
    },
    complete() {
      // complete is not called on error
      expect(false).toBeTruthy();
    }
  });

  expect(calledError).toBe(true);
  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
})

test('streams are unicast', () => {
  let resource = 0;
  const obs$ = new Stream<number>(observer => {
    resource++;
    observer.next(1); observer.next(2); observer.next(3);
  })

  obs$.subscribe(v => null);
  obs$.subscribe(v => null);

  expect(resource).toBe(2);
})

test('pipe', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.pipe(
    map(v => v + 1), map(v => v + 2),
  ).subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [4, 5, 6])).toBeTruthy();
})

test('map operator', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.map(v => v + 3).subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [4, 5, 6])).toBeTruthy();
})


test('filter operator', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.filter(v => v === 2 || v === 3).subscribe(v => result.push(v));
  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
})

test('map & filter chain', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
    observer.next(4); observer.next(5); observer.next(6);
  })

  let result: (number | string)[] = [];
  obs$.map(v => v + 2)
    .filter(v => v % 2 === 0)
    .map(v => v === 4 ? 'hi' : v)
    .subscribe(v => result.push(v));

  expect(result.length).toBe(3);
  expect(arrayCompare(result, ['hi', 6, 8])).toBeTruthy();

  result = [];
  obs$.pipe(
    map(v => v + 2), filter(v => v % 2 === 0), map(v => v === 4 ? 'hi' : v),
  ).subscribe(v => result.push(v));

  expect(result.length).toBe(3);
  expect(arrayCompare(result, ['hi', 6, 8])).toBeTruthy();
})

test('custom operators', () => {
  const obs$ = new Stream<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
    observer.next(4); observer.next(5); observer.next(6);
  })

  const customOperator: () => OperatorFunction<number, number | string> = () =>
    pipe(
      map((v: number) => v + 2), filter((v: number) => v % 2 === 0),
      map(v => v === 4 ? 'hi' : v),
    );

  const result: (number | string)[] = [];
  obs$.pipe(
    customOperator(),
  ).subscribe(v => result.push(v));

  expect(result.length).toBe(3);
  expect(arrayCompare(result, ['hi', 6, 8])).toBeTruthy();

})

test('async subscribe & cleanup', async () => {
  const values: {
    one: number[], two: number[]
  } = {
    one: [], two: []
  }

  let cleared = 0;

  const obs = new Stream<number>(obs => {
    let val = 0;
    const interval = setInterval(() => obs.next(val++), 10);
    // console.log(interval);
    return () => {
      clearInterval(interval);
      cleared++;
    }
  })

  const unsub1 = obs.subscribe(v => {
    values.one.push(v);
  })

  const unsub2 = obs.subscribe(v => {
    values.two.push(v);
  })

  setTimeout(() => {
    unsub1(); // console.log('unsub 1');
  }, 55);

  setTimeout(() => {
    unsub2(); // console.log('unsub 2');
  }, 105);

  expect(cleared).toBe(0);

  await sleep(70);

  expect(cleared).toBe(1);

  await sleep(200);

  expect(cleared).toBe(2);
  
  expect(arrayCompare(values.one, [0, 1, 2, 3, 4])).toBeTruthy();
  expect(arrayCompare(values.two, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeTruthy();
})
