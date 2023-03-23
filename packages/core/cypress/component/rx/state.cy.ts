import { rx } from '$thispkg';
import { attempt } from '../../support/helpers';

describe('state', () => {
  it('subscribe & unsubscribe', attempt(() => {
    const subj$ = new rx.State(1);
    const result: number[] = [];

    expect((subj$ as any).observers.length).to.be.eq(0);

    const unsubcribe = subj$.subscribe(v => result.push(v));

    expect((subj$ as any).observers.length).to.be.eq(1);
    expect(result).to.deep.eq([1]);
    subj$.next(2);
    expect(result).to.deep.eq([1, 2]);
    subj$.next(3);
    expect(result).to.deep.eq([1, 2, 3]);
    unsubcribe();
    expect((subj$ as any).observers.length).to.be.eq(0);
    subj$.next(4);
    expect(result).to.deep.eq([1, 2, 3]);
    expect((subj$ as any).observers.length).to.be.eq(0);
  }))


  it('subscribe & unsubscribe with operator chain', attempt(() => {
    const subj$ = new rx.State(1);
    const result: number[] = [];

    expect((subj$ as any).observers.length).to.be.eq(0);

    const unsubcribe = subj$
      .map(v => v + 1)
      .map(v => v + 1)
      .subscribe(v => result.push(v));

    expect((subj$ as any).observers.length).to.be.eq(1);

    expect(result).to.deep.eq([3]);
    subj$.next(2);
    expect(result).to.deep.eq([3, 4]);
    subj$.next(3);
    expect(result).to.deep.eq([3, 4, 5]);
    unsubcribe();
    subj$.next(4);
    expect(result).to.deep.eq([3, 4, 5]);

    expect((subj$ as any).observers.length).to.be.eq(0);
  }))

  it('completing', attempt(() => {
    const subj$ = new rx.State(1);
    const result: number[] = [];
    let completed = false;

    subj$
      .map(v => v + 2)
      .subscribe({
        next(v) { result.push(v) },
        complete() { completed = true; }
      });

    expect((subj$ as any).observers.length).to.be.eq(1);

    expect(result).to.deep.eq([3]);
    subj$.next(2);
    expect(result).to.deep.eq([3, 4]);
    subj$.next(3);
    expect(result).to.deep.eq([3, 4, 5]);
    expect(completed).to.be.false;
    subj$.complete();
    expect(completed).to.be.true;
    subj$.next(4);
    expect(result).to.deep.eq([3, 4, 5]);

    expect((subj$ as any).observers.length).to.be.eq(0);
  }))

  it('partial linked state', attempt(() => {
    const state = new rx.State({
      flatString: 'hi',
      flatNumber: 4,
      nested: {
        str: 'yes',
        num: 2,
      }
    });

    const partials = {
      flatString: state.partial('flatString'),
      flatNumber: state.partial('flatNumber'),
      nestedStr: state.partial('nested', 'str'),
      nestedNum: state.partial('nested', 'num'),
    };

    let count = {
      state: 0,
      flatString: 0,
      flatNumber: 0,
      nestedStr: 0,
      nestedNum: 0,
    }

    const unsub = {
      state: state.subscribe(_ => count.state++),
      flatString: partials.flatString.subscribe(_ => {
        // console.log(_)
        count.flatString++
      }),
      flatNumber: partials.flatNumber.subscribe(_ => count.flatNumber++),
      nestedStr: partials.nestedStr.subscribe(_ => count.nestedStr++),
      nestedNum: partials.nestedNum.subscribe(_ => count.nestedNum++),
    }

    for (let c in count) expect(count[c as keyof typeof count]).to.be.eq(1);

    expect(state.value.flatString).to.be.eq('hi');
    expect(partials.flatString.value).to.be.eq('hi');
    partials.flatString.next('hi2');
    expect(state.value.flatString).to.be.eq('hi2');
    expect(partials.flatString.value).to.be.eq('hi2');

    expect(state.value.nested.str).to.be.eq('yes');
    expect(partials.nestedStr.value).to.be.eq('yes');
    partials.nestedStr.next('yes2');
    expect(state.value.nested.str).to.be.eq('yes2');
    expect(partials.nestedStr.value).to.be.eq('yes2');

    expect(JSON.stringify(state.value)).to.be.eq(JSON.stringify({
      flatString: 'hi2',
      flatNumber: 4,
      nested: {
        str: 'yes2',
        num: 2,
      }
    }));

    expect(state.value.nested.num).to.be.eq(2);
    expect(partials.nestedNum.value).to.be.eq(2);
    partials.nestedNum.next(3);
    expect(state.value.nested.num).to.be.eq(3);
    expect(partials.nestedNum.value).to.be.eq(3);

    partials.nestedNum.next(v => v + 1);
    expect(state.value.nested.num).to.be.eq(4);
    expect(partials.nestedNum.value).to.be.eq(4);

    expect(JSON.stringify(state.value)).to.be.eq(JSON.stringify({
      flatString: 'hi2',
      flatNumber: 4,
      nested: {
        str: 'yes2',
        num: 4,
      }
    }));

    state.next({
      flatString: 'hi2',
      flatNumber: 5,
      nested: {
        str: 'yes2',
        num: 4,
      }
    });

    expect(partials.flatNumber.value).to.be.eq(5);

    expect(count.flatNumber).to.be.eq(2);
    expect(count.flatString).to.be.eq(2);
    expect(count.nestedNum).to.be.eq(3);
    partials.nestedNum.next(4);
    partials.nestedNum.next(4);
    expect(count.nestedNum).to.be.eq(3); // memoization

    expect(count.state).to.be.eq(8);

    Object.keys(unsub).forEach(k => unsub[k as keyof typeof unsub]());

    expect(count.flatNumber).to.be.eq(2);
    expect(count.flatString).to.be.eq(2);
    expect(count.nestedNum).to.be.eq(3);
    partials.nestedNum.next(4);
    partials.nestedNum.next(4);
    expect(count.nestedNum).to.be.eq(3); // memoization

    expect(count.state).to.be.eq(8);

    expect(partials.flatNumber.value).to.be.eq(5);
    expect(partials.flatString.value).to.be.eq('hi2');
    expect(partials.nestedNum.value).to.be.eq(4);
    expect(partials.nestedStr.value).to.be.eq('yes2');
  }))

  it('custom linked state', attempt(() => {
    const state = new rx.State(1);
    const linked = state.createLinked(
      v => v + 1,
      v => v - 1,
    );

    linked.next(3);
    expect(linked.value).to.be.eq(3);
    expect(state.value).to.be.eq(2);
  }))

})

