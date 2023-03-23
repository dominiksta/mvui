import { testFromLatest } from './operators/fromLatest';
import { testIfElese } from './operators/ifelse';

describe('operators', () => {
  it('fromLatest', testFromLatest());
  it('ifelse', testIfElese());
})

