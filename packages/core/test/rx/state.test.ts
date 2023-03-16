import { test, expect } from '@jest/globals';
import { arrayCompare } from 'util/datastructure';
import { State, Stream } from 'rx';

test('subscribe & unsubscribe', () => {
  const subj$ = new State(1);
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
  const subj$ = new State(1);
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
  const subj$ = new State(1);
  const result: number[] = [];
  let completed = false;

  subj$
  .map(v => v + 2)
  .subscribe({
    next(v) { result.push(v) },
    complete() { completed = true; }
  });

  expect((subj$ as any).observers.length).toBe(1);

  expect(arrayCompare(result, [3])).toBeTruthy();
  subj$.next(2);
  expect(arrayCompare(result, [3, 4])).toBeTruthy();
  subj$.next(3);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();
  expect(completed).toBeFalsy();
  subj$.complete();
  expect(completed).toBeTruthy();
  subj$.next(4);
  expect(arrayCompare(result, [3, 4, 5])).toBeTruthy();

  expect((subj$ as any).observers.length).toBe(0);
})

test('partial linked state', () => {
  const state = new State({
    flatString: 'hi',
    flatNumber: 4,
    nested: {
      str: 'yes',
      num: 2,
    }
  });

  const partials = {
    flatString: state.partial('flatString'),
    flatNumber: state.partial('flatNumber'),
    nestedStr: state.partial('nested', 'str'),
    nestedNum: state.partial('nested', 'num'),
  };

  let count = {
    state: 0,
    flatString: 0,
    flatNumber: 0,
    nestedStr: 0,
    nestedNum: 0,
  }

  const unsub = {
    state: state.subscribe(_ => count.state++),
    flatString: partials.flatString.subscribe(_ => {
      // console.log(_)
      count.flatString++
    }),
    flatNumber: partials.flatNumber.subscribe(_ => count.flatNumber++),
    nestedStr: partials.nestedStr.subscribe(_ => count.nestedStr++),
    nestedNum: partials.nestedNum.subscribe(_ => count.nestedNum++),
  }

  for (let c in count) expect(count[c as keyof typeof count]).toBe(1);

  expect(state.value.flatString).toBe('hi');
  expect(partials.flatString.value).toBe('hi');
  partials.flatString.next('hi2');
  expect(state.value.flatString).toBe('hi2');
  expect(partials.flatString.value).toBe('hi2');

  expect(state.value.nested.str).toBe('yes');
  expect(partials.nestedStr.value).toBe('yes');
  partials.nestedStr.next('yes2');
  expect(state.value.nested.str).toBe('yes2');
  expect(partials.nestedStr.value).toBe('yes2');

  expect(JSON.stringify(state.value)).toBe(JSON.stringify({
    flatString: 'hi2',
    flatNumber: 4,
    nested: {
      str: 'yes2',
      num: 2,
    }
  }));

  expect(state.value.nested.num).toBe(2);
  expect(partials.nestedNum.value).toBe(2);
  partials.nestedNum.next(3);
  expect(state.value.nested.num).toBe(3);
  expect(partials.nestedNum.value).toBe(3);

  partials.nestedNum.next(v => v + 1);
  expect(state.value.nested.num).toBe(4);
  expect(partials.nestedNum.value).toBe(4);

  expect(JSON.stringify(state.value)).toBe(JSON.stringify({
    flatString: 'hi2',
    flatNumber: 4,
    nested: {
      str: 'yes2',
      num: 4,
    }
  }));

  state.next({
    flatString: 'hi2',
    flatNumber: 5,
    nested: {
      str: 'yes2',
      num: 4,
    }
  });

  expect(partials.flatNumber.value).toBe(5);

  expect(count.flatNumber).toBe(2);
  expect(count.flatString).toBe(2);
  expect(count.nestedNum).toBe(3);
  partials.nestedNum.next(4);
  partials.nestedNum.next(4);
  expect(count.nestedNum).toBe(3); // memoization

  expect(count.state).toBe(8);

  Object.keys(unsub).forEach(k => unsub[k as keyof typeof unsub]());

  expect(count.flatNumber).toBe(2);
  expect(count.flatString).toBe(2);
  expect(count.nestedNum).toBe(3);
  partials.nestedNum.next(4);
  partials.nestedNum.next(4);
  expect(count.nestedNum).toBe(3); // memoization

  expect(count.state).toBe(8);

  expect(partials.flatNumber.value).toBe(5);
  expect(partials.flatString.value).toBe('hi2');
  expect(partials.nestedNum.value).toBe(4);
  expect(partials.nestedStr.value).toBe('yes2');
})

test('custom linked state', () => {
  const state = new State(1);
  const linked = state.createLinked(
    v => v + 1,
    v => v - 1,
  );

  linked.next(3);
  expect(linked.value).toBe(3);
  expect(state.value).toBe(2);
})
