import { test, expect } from '@jest/globals';
import propWatching from 'rx/prop-watching';

test('watching normal props', async () => {

  class Test {
    p = 2;
  }

  const test = new Test();

  let count = 0;
  propWatching.addChangedListener(test, 'p', _ => {
    count++;
  });

  expect(count).toBe(0); expect(test.p).toBe(2);
  test.p = 4;
  expect(count).toBe(1); expect(test.p).toBe(4);
  test.p = 4; test.p = 7;
  expect(count).toBe(3); expect(test.p).toBe(7);


  const listener = () => { count++; };

  // adding the same listener more then once should be a no-op, like in
  // HTMLElement#addEventListener

  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);

  expect(count).toBe(3); expect(test.p).toBe(7);
  test.p = 4;
  expect(count).toBe(5); expect(test.p).toBe(4);
  test.p = 4; test.p = 8;
  expect(count).toBe(9); expect(test.p).toBe(8);

})


test('watching props with getters & setters', async () => {
  
  class Test {
    _p = 2;
    set p(v: number) {
      // console.debug(`setter called with ${v}`);
      sideEffects++;
      this._p = v;
    }
    get p() { return this._p; }
  }
  
  const test = new Test();
  
  let sideEffects = 0;
  let count = 0;
  propWatching.addChangedListener(test, 'p', v => {
    count++;
  });
  
  expect(test._p).toBe(2); expect(test.p).toBe(2); expect(count).toBe(0);
  expect(sideEffects).toBe(count);
  test.p = 4;
  expect(test._p).toBe(4); expect(test.p).toBe(4); expect(count).toBe(1);
  expect(sideEffects).toBe(count);
  test.p = 4; test.p = 7;
  expect(test._p).toBe(7); expect(test.p).toBe(7); expect(count).toBe(3); 
  expect(sideEffects).toBe(count);

  propWatching.addChangedListener(test, 'p', v => {
    count++;
  });

  expect(test._p).toBe(7); expect(test.p).toBe(7); expect(count).toBe(3);
  test.p = 4;
  expect(test._p).toBe(4); expect(test.p).toBe(4); expect(count).toBe(5);
  expect(sideEffects).toBe(4);
  test.p = 4; test.p = 8;
  expect(test._p).toBe(8); expect(test.p).toBe(8); expect(count).toBe(9); 
  expect(sideEffects).toBe(6);
  
})

test('removing listeners for normal props', async () => {
  
  class Test {
    p = 2;
  }
  
  const test = new Test();
  
  let count = 0;

  const listener = () => { count++; };

  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);

  expect(test.p).toBe(2); expect(count).toBe(0);
  test.p = 4;
  expect(test.p).toBe(4); expect(count).toBe(1);

  propWatching.removeChangedListener(test, 'p', listener);

  test.p = 7;
  expect(test.p).toBe(7); expect(count).toBe(1);
})

test('removing listeners for props with getters & setters', async () => {
  
  class Test {
    _p = 2;
    set p(v) {
      // console.debug(`setter called with ${v}`);
      this._p = v;
    }
    get p() { return this._p; }
  }
  
  const test = new Test();
  
  let count = 0;

  const listener = () => { count++; };

  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);

  expect(test._p).toBe(2); expect(test.p).toBe(2); expect(count).toBe(0);
  test.p = 4;
  expect(test._p).toBe(4); expect(test.p).toBe(4); expect(count).toBe(1);

  propWatching.removeChangedListener(test, 'p', listener);

  test.p = 7;
  expect(test._p).toBe(7); expect(test.p).toBe(7); expect(count).toBe(1);

})


test('removing listeners cleanup for normal props', async () => {
  class Test {
    p = 2;
  }
  
  const test = new Test();
  
  let count = 0;

  const listener = () => { count++; };

  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);
  test.p = 4;
  propWatching.removeChangedListener(test, 'p', listener);
  test.p = 7;

  const desc = Object.getOwnPropertyDescriptors(test).p;
  expect('get' in desc).toBe(false);
  expect('set' in desc).toBe(false);
})


test('removing listeners cleanup for props with getters & setters', async () => {

  class Test {
    _p = 2;
    set p(v) {
      // console.debug(`setter called with ${v}`);
      this._p = v;
    }
    get p() { return this._p; }
  }
  
  const test = new Test();
  
  let _count = 0;

  const origDesc = Object.getOwnPropertyDescriptors(test.constructor.prototype).p;
  // console.log(origDesc);
  const orig = { set: origDesc.set, get: origDesc.get };

  const listener = () => { _count++; };

  propWatching.addChangedListener(test, 'p', listener);
  propWatching.addChangedListener(test, 'p', listener);
  test.p = 4;
  propWatching.removeChangedListener(test, 'p', listener);
  test.p = 7;

  const desc = Object.getOwnPropertyDescriptors(test).p;
  expect(desc.get).toBe(orig.get);
  expect(desc.set).toBe(orig.set);
})
