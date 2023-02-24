import { test, expect } from '@jest/globals';
import { State } from 'rx';
import Selector from 'rx/selector';

test('basic selection', () => {

  const state1 = new State({ hi: 0 });

  let value = 0;
  let count = 0;
  const selector = Selector.create(
    state1, s1 => {
      count++;
      return s1.hi + 1;
    }
  );

  expect(count).toBe(0);
  expect((selector as any).observers.length).toBe(0);
  expect(selector.value).toBe(1);
  expect(count).toBe(1);
  expect((selector as any).observers.length).toBe(0);

  const unsub = selector.subscribe(v => value = v);

  expect(count).toBe(2);
  expect(value).toBe(1); expect(selector.value).toBe(1);

  state1.next({ hi: 3 });

  expect(count).toBe(3);
  expect(value).toBe(4); expect(selector.value).toBe(4);

  unsub();

  expect(count).toBe(3);
  expect(value).toBe(4); expect(selector.value).toBe(4);
  expect(count).toBe(4);
});

test('selection with multiple parents', () => {
  
  const state1 = new State({ hi: 4 });
  const state2 = new State({ yes: 2 });
  
  let value = 0;
  let count = 0;
  const selector = Selector.create(
    state1, state2, (s1, s2) => {
      count++;
      return s1.hi + s2.yes;
    }
  );
  
  expect(count).toBe(0);
  expect((selector as any).observers.length).toBe(0);
  expect(selector.value).toBe(6);
  expect(count).toBe(1);
  expect((selector as any).observers.length).toBe(0);
  
  const unsub = selector.subscribe(v => value = v);
  expect(count).toBe(2);
  
  expect(value).toBe(6);
  expect(selector.value).toBe(6);
  expect(count).toBe(2);
  
  state1.next({ hi: 7 });
  
  expect(count).toBe(3);
  expect(value).toBe(9); 
  expect(selector.value).toBe(9);
  expect(count).toBe(3);
  
  unsub();
  
  expect(count).toBe(3);
  expect(value).toBe(9);

  expect(selector.value).toBe(9);
  expect(count).toBe(4);
});


test('chained selectors', () => {
  
  const state1 = new State({ hi: 4 });
  const state2 = new State({ yes: 2 });
  
  let value1 = 0;
  let value2 = 0;
  let count1 = 0;
  let count2 = 0;

  const selector1 = Selector.create(
    state1, state2, (s1, s2) => {
      count1++;
      return s1.hi + s2.yes;
    }
  );

  const selector2 = Selector.create(
    state1, selector1, (st1, se2) => {
      count2++;
      return st1.hi + se2
    }
  );

  expect(count1).toBe(0); expect(count2).toBe(0);
  expect((selector2 as any).observers.length).toBe(0);
  expect((selector1 as any).observers.length).toBe(0);

  expect(selector2.value).toBe(10);

  expect((selector2 as any).observers.length).toBe(0);
  expect((selector1 as any).observers.length).toBe(0);
  expect(count1).toBe(1); expect(count2).toBe(1);

  const unsub2 = selector2.subscribe(v => value2 = v);
   
  expect((selector2 as any).observers.length).toBe(1);
  expect((selector1 as any).observers.length).toBe(1);
  expect(count1).toBe(2); expect(count2).toBe(2);
  // expect(selector2.value).toBe(10);

  state1.next({ hi: 6 });

  expect(count1).toBe(3); expect(count2).toBe(4);
  expect(value2).toBe(14);

  const unsub1 = selector1.subscribe(v => value1 = v);

  expect(count1).toBe(3); expect(count2).toBe(4);
  expect(value1).toBe(8);

  expect(selector1.value).toBe(8);

  expect(count1).toBe(3); expect(count2).toBe(4);

  unsub2();
  expect((selector2 as any).observers.length).toBe(0);

  unsub1();
  expect((selector2 as any).observers.length).toBe(0);
  expect((selector1 as any).observers.length).toBe(0);
});

test('selectors are multicast', () => {

  const state1 = new State({ hi: 0 });

  let count = 0;
  const selector = Selector.create(
    state1, s1 => {
      count++;
      return s1.hi + 1;
    }
  );

  selector.subscribe(_ => null);
  selector.subscribe(_ => null);

  expect(count).toBe(1);

  state1.next({hi: 4});

  expect(count).toBe(2);
})


test('shorthands', () => {

  const state1 = new State({ hi: 0 });

  let count = 0;
  let value = 0;
  const selector = state1.select(s1 => {
    count++;
    return s1.hi + 1;
  }).select(v => v + 1);

  expect(count).toBe(0);
  expect((selector as any).observers.length).toBe(0);
  expect(selector.value).toBe(2);
  expect(count).toBe(1);
  expect((selector as any).observers.length).toBe(0);

  const unsub = selector.subscribe(v => value = v);

  expect(count).toBe(2);
  expect(value).toBe(2); expect(selector.value).toBe(2);

  state1.next({ hi: 3 });

  expect(count).toBe(3);
  expect(value).toBe(5); expect(selector.value).toBe(5);

  unsub();

  expect(count).toBe(3);
  expect(value).toBe(5); expect(selector.value).toBe(5);
  expect(count).toBe(4);
})


test('memoization', () => {

  const state1 = new State(5);

  let count = 0;
  const selector = state1.select(s1 => {
    count++;
    return s1 + 1;
  }).select(v => v + 1);

  expect(count).toBe(0);

  let emissionCount = 0;
  const unsub = selector.subscribe(_ => emissionCount++);

  expect(count).toBe(1); expect(emissionCount).toBe(1);

  state1.next(5);
  state1.next(5);
  state1.next(5);

  expect(count).toBe(1);
  expect(emissionCount).toBe(4);

  state1.next(6);

  expect(count).toBe(2);

  unsub();
})
