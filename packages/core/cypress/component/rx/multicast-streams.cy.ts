import { rx } from '$thispkg';

describe('MulticastStream', () => {

  it('they are multicast', () => {
    let resource = 0;
    const obs$ = new rx.Stream<number>(observer => {
      resource++;
      // console.log(observer.next);
      observer.next(1); observer.next(2); observer.next(3);
    })

    const subj$ = new rx.MulticastStream<number>();
    // console.log(subj$);

    subj$.subscribe();
    subj$.subscribe();

    obs$.subscribe(subj$);

    expect(resource).to.be.eq(1);
  })

})
