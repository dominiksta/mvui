import { testCatchError } from './operators/catchError';
import { testFromLatest } from './operators/combineLatest';
import { testDebounce } from './operators/debounce';
import { testIfElese } from './operators/ifelse';
import { testRetry } from './operators/retry';
import { testScan } from './operators/scan';
import { testSwitchMap } from './operators/switchMap';
import { testTake } from './operators/take';

describe('operators', () => {
  it('combineLatest', testFromLatest());
  it('ifelse', testIfElese());
  it('catchError', testCatchError());
  it('take', testTake());
  it('scan', testScan());
  it('debounce', testDebounce());
  it('retry', testRetry());
  it('switchMap', testSwitchMap());
})

