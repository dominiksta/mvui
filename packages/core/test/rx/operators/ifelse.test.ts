import { test, expect } from '@jest/globals';
import { State } from 'rx';

test('ifelse', () => {
  const s = new State(0);

  let value = 'initial';
  let value2: string | undefined = 'initial';
  s.derive(s => s === 2)
    .ifelse({ if: 'yes', else: 'no' })
    .subscribe(v => value = v);

  s.derive(s => s === 2)
    .if('hi')
    .subscribe(v => value2 = v);

  expect(value).toBe('no');
  expect(value2).toBe(undefined);

  s.next(1); expect(value).toBe('no');  expect(value2).toBe(undefined);
  s.next(2); expect(value).toBe('yes'); expect(value2).toBe('hi');
  s.next(2); expect(value).toBe('yes'); expect(value2).toBe('hi');
  s.next(3); expect(value).toBe('no');  expect(value2).toBe(undefined);
})
