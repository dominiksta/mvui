import { test, expect } from '@jest/globals';
import { arrayCompare } from '../util/datastructure';
import Subject from './subject';

test('subscribe & unsubscribe', () => {
  const subj$ = new Subject(1);
  const result: number[] = [];

  expect((subj$ as any).observers.length).toBe(0);

  const unsubcribe = subj$.subscribe(v => result.push(v));

  expect((subj$ as any).observers.length).toBe(1);
  expect(arrayCompare(result, [1])).toBeTruthy();
  subj$.next(2);
  expect(arrayCompare(result, [1, 2])).toBeTruthy();
  subj$.next(3);
  expect(arrayCompare(result, [1, 2, 3])).toBeTruthy();
  unsubcribe();
  expect((subj$ as any).observers.length).toBe(0);
  subj$.next(4);
  expect(arrayCompare(result, [1, 2, 3])).toBeTruthy();
  expect((subj$ as any).observers.length).toBe(0);
})


test('subscribe & unsubscribe with operator chain', () => {
  const subj$ = new Subject(1);
  const result: number[] = [];

  expect((subj$ as any).observers.length).toBe(0);

  const unsubcribe = subj$
    .map(v => v + 1)
    .map(v => v + 1)
    .subscribe(v => result.push(v));

  expect((subj$ as any).observers.length).toBe(1);

  expect(arrayCompare(result, [3])).toBeTruthy();
  subj$.next(2);
  expect(arrayCompare(result, [3, 4])).toBeTruthy();
  subj$.next(3);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();
  unsubcribe();
  subj$.next(4);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();

  expect((subj$ as any).observers.length).toBe(0);
})


test('completing', () => {
  const subj$ = new Subject(1);
  const result: number[] = [];

  expect((subj$ as any).observers.length).toBe(0);

  const unsubcribe = subj$
    .map(v => v + 1)
    .map(v => v + 1)
    .subscribe(v => result.push(v));

  expect((subj$ as any).observers.length).toBe(1);

  expect(arrayCompare(result, [3])).toBeTruthy();
  subj$.next(2);
  expect(arrayCompare(result, [3, 4])).toBeTruthy();
  subj$.next(3);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();
  subj$.complete();
  subj$.next(4);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();

  expect((subj$ as any).observers.length).toBe(0);
})
