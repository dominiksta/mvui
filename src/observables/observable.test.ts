import { test, expect } from '@jest/globals';
import { arrayCompare } from '../util/datastructure';
import Observable from './observable';
import Subject from './subject';


test('subscribing to a synchronous definition returns the correct result', () => {
  const obs$ = new Observable<number>(next => {
    next(1); next(2); next(3);
  })

  const result: number[] = [];
  obs$.subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [1, 2, 3])).toBeTruthy();
})


test('map operator', () => {
  const obs$ = new Observable<number>(next => {
    next(1); next(2); next(3);
  })

  const result: number[] = [];
  obs$.map(v => v + 3).subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, [4, 5, 6])).toBeTruthy();
})


test('filter operator', () => {
  const obs$ = new Observable<number>(next => {
    next(1); next(2); next(3);
  })

  const result: number[] = [];
  obs$.filter(v => v === 2 || v === 3).subscribe(v => result.push(v));
  expect(result.length).toBe(2);
  expect(arrayCompare(result, [2, 3])).toBeTruthy();
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
})

test('map & filter chain', () => {
  const obs$ = new Observable<number>(next => {
    next(1); next(2); next(3);
    next(4); next(5); next(6);
  })

  const result: (number | string)[] = [];
  obs$.map(v => v + 2)
    .filter(v => v % 2 === 0)
    .map(v => v === 4 ? 'hi' : v)
    .subscribe(v => result.push(v));
  expect(result.length).toBe(3);
  expect(arrayCompare(result, ['hi', 6, 8])).toBeTruthy();
})
