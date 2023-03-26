import { testFromLatest } from './operators/combineLatest';
import { testIfElese } from './operators/ifelse';

describe('operators', () => {
  it('combineLatest', testFromLatest());
  it('ifelse', testIfElese());
})

