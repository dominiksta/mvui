import { test, expect } from '@jest/globals';
import { Stream, State } from 'rx';
import { fromLatest } from 'rx/operators';

test('fromLatest', () => {
  const [counter, multiplier] = [new State(2), new State(5)];

  function testSum(sum: Stream<number>) {
    sum.subscribe(v => {
      expect(v).toBe(counter.value * multiplier.value);
    });
    counter.next(4);
    multiplier.next(3);
    counter.next(2);
    multiplier.next(5);
  }

  const sumObj = fromLatest(
    { c: counter, m: multiplier }
  ).map(v => v.c * v.m);
  testSum(sumObj);

  const sumArr1 = fromLatest(
    [counter, multiplier]
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr1);

  const sumArr2 = fromLatest(
    counter, multiplier
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr2);
})

