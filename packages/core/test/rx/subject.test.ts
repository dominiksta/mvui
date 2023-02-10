import { test, expect } from '@jest/globals';
import { Subject, Observable } from 'rx';

test('subjects are multicast', () => {
  let resource = 0;
  const obs$ = new Observable<number>(observer => {
    resource++;
    // console.log(observer.next);
    observer.next(1); observer.next(2); observer.next(3);
  })

  const subj$ = new Subject<number>();
  // console.log(subj$);

  subj$.subscribe(_ => null);
  subj$.subscribe(_ => null);

  obs$.subscribe(subj$);

  expect(resource).toBe(1);
})
