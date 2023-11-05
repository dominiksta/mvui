import { testCatchError } from './operators/catchError';
import { testFromLatest } from './operators/combineLatest';
import { testDebounce } from './operators/debounce';
import { testErrorInChain } from './operators/errorInChain';
import { testIfElese } from './operators/ifelse';
import { testRetry } from './operators/retry';
import { testScan } from './operators/scan';
import { testShowStatus } from './operators/showStatus';
import { testStartWith } from './operators/startWith';
import { testSwitchMap } from './operators/switchMap';
import { testTake } from './operators/take';
import { testTakeUntil } from './operators/takeUntil';
import { testThrottle } from './operators/throttle';
import { testTimeout } from './operators/timeout';
import * as other from './operators/other';
import { testMergeWith } from './operators/mergeWith';
import { testConcatWith } from './operators/concatWith';

describe('operators', () => {
  it('showStatus & handleStatus', testShowStatus());
  it('catchError', testCatchError());
  it('combineLatest', testFromLatest());
  it('debounce', testDebounce());
  it('errorInChain', testErrorInChain());
  it('ifelse', testIfElese());
  it('retry', testRetry());
  it('scan', testScan());
  it('startWith', testStartWith());
  it('switchMap', testSwitchMap());
  it('take', testTake());
  it('timeout', testTimeout());
  it('takeUntil', testTakeUntil());
  it('throttle', testThrottle());
  it('mergeWith', testMergeWith());
  it('concatWith', testConcatWith());
  it('last', other.testLast());
  it('first', other.testFirst());
  it('defaultIfEmpty', other.testDefaultIfEmpty());
  it('find', other.testFind());
  it('findIndex', other.testFindIndex());
  it('toArray', other.testToArray());
  it('every', other.testEvery());
  it('count', other.testCount());
  it('isEmpty', other.testIsEmpty());
  it('isEmpty', other.testIsEmpty());
})

