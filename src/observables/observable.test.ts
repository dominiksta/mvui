import { test, expect } from '@jest/globals';
import { arrayCompare } from '../util/datastructure';
import Observable from './observable';
import Subject from './subject';


test('subscribing to a synchronous definition returns the correct result', () => {
  const obs$ = new Observable<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [1, 2, 3])).toBeTruthy();
})

test('completion', () => {
  const obs$ = new Observable<number>(observer => {
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
  const obs$ = new Observable<number>(observer => {
    observer.next(1);
    observer.next(2);
    // note that if we threw in a setTimeout here, the error would not be caught. while
    // maybe unintuitive, this is actually also how it works in rxjs
    throw new Error('hi');
    // observer.complete();
    observer.next(3);
  })

  let result: number[] = [];
  obs$.map(v => v + 1).subscribe({
    next(v) { result.push(v) },
    error(e) {
      expect(e instanceof Error).toBeTruthy();
      expect(e.message).toBe('hi');
    },
    complete() {
      // complete is not called on error
      expect(false).toBeTruthy();
    }
  });

  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
})


test('map operator', () => {
  const obs$ = new Observable<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.map(v => v + 3).subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [4, 5, 6])).toBeTruthy();
})


test('filter operator', () => {
  const obs$ = new Observable<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
  })

  const result: number[] = [];
  obs$.filter(v => v === 2 || v === 3).subscribe(v => result.push(v));
  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
})

test('select', () => {
  const base = new Subject({a: 0, b: '0'});
  const counters = {a: 0, b: 0};
  base.select(s => s.a).subscribe(v => {
    counters.a++;
    expect(v).toBe(base.value.a)
  });
  base.select(s => s.b).subscribe(v => {
    counters.b++;
    expect(v).toBe(base.value.b)
  });
  base.next({a: 0, b: '1'});
  base.next({a: 0, b: '2'});
  base.next({a: 1, b: '2'});
  base.next({a: 2, b: '2'});
  base.next({a: 3, b: '2'});
  expect(counters.a).toBe(4);
  expect(counters.b).toBe(3);
})

test('fromLatest', () => {
  const [counter, multiplier] = [new Subject(2), new Subject(5)];

  function testSum(sum: Observable<number>) {
    sum.subscribe(v => {
      expect(v).toBe(counter.value * multiplier.value);
    });
    counter.next(4);
    multiplier.next(3);
    counter.next(2);
    multiplier.next(5);
  }

  const sumObj = Observable.fromLatest(
    { c: counter, m: multiplier }
  ).map(v => v.c * v.m);
  testSum(sumObj);

  const sumArr1 = Observable.fromLatest(
    [counter, multiplier]
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr1);

  const sumArr2 = Observable.fromLatest(
    counter, multiplier
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr2);
})

test('map & filter chain', () => {
  const obs$ = new Observable<number>(observer => {
    observer.next(1); observer.next(2); observer.next(3);
    observer.next(4); observer.next(5); observer.next(6);
  })

  const result: (number | string)[] = [];
  obs$.map(v => v + 2)
    .filter(v => v % 2 === 0)
    .map(v => v === 4 ? 'hi' : v)
    .subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, ['hi', 6, 8])).toBeTruthy();
})
