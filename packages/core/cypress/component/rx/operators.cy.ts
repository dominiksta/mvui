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
  it('combineLatest', testFromLatest());
  it('ifelse', testIfElese());
  it('catchError', testCatchError());
  it('startWith', testStartWith());
  it('take', testTake());
  it('takeUntil', testTakeUntil());
  it('scan', testScan());
  it('debounce', testDebounce());
  it('throttle', testThrottle());
  it('retry', testRetry());
  it('switchMap', testSwitchMap());
})

