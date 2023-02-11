import { test, expect } from '@jest/globals';
import { MulticastStream, Stream } from 'rx';

test('MulticastStreams are... well they are multicast', () => {
  let resource = 0;
  const obs$ = new Stream<number>(observer => {
    resource++;
    // console.log(observer.next);
    observer.next(1); observer.next(2); observer.next(3);
  })

  const subj$ = new MulticastStream<number>();
  // console.log(subj$);

  subj$.subscribe(_ => null);
  subj$.subscribe(_ => null);

  obs$.subscribe(subj$);

  expect(resource).toBe(1);
})
