import { testCatchError } from './operators/catchError';
import { testFromLatest } from './operators/combineLatest';
import { testDebounce } from './operators/debounce';
import { testIfElese } from './operators/ifelse';
import { testRetry } from './operators/retry';
import { testScan } from './operators/scan';
import { testStartWith } from './operators/startWith';
import { testSwitchMap } from './operators/switchMap';
import { testTake } from './operators/take';
import { testTakeUntil } from './operators/takeUntil';
import { testThrottle } from './operators/throttle';

describe('operators', () => {
  it('catchError', testCatchError());
  it('combineLatest', testFromLatest());
  it('debounce', testDebounce());
  it('errorInChain', testSwitchMap());
  it('ifelse', testIfElese());
  it('retry', testRetry());
  it('scan', testScan());
  it('startWith', testStartWith());
  it('switchMap', testSwitchMap());
  it('take', testTake());
  it('takeUntil', testTakeUntil());
  it('throttle', testThrottle());
})

