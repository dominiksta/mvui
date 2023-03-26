import { testCatchError } from './operators/catchError';
import { testFromLatest } from './operators/combineLatest';
import { testIfElese } from './operators/ifelse';
import { testRetry } from './operators/retry';
import { testTake } from './operators/take';

describe('operators', () => {
  it('combineLatest', testFromLatest());
  it('ifelse', testIfElese());
  it('catchError', testCatchError());
  it('take', testTake());
  it('retry', testRetry());
})

