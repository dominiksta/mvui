import { rx } from '$thispkg';
import { attempt } from '../../support/helpers';

describe('derived state', () => {
  it('basic derivation', attempt(() => {

    const state1 = new rx.State({ hi: 0 });

    let count = 0;
    const derived = rx.derive(
      state1, s1 => {
        count++;
        return s1.hi + 1;
      }
    );

    expect(count).to.be.eq(0);
    expect((derived as any).observers.length).to.be.eq(0);
    expect(derived.value).to.be.eq(1);
    expect(count).to.be.eq(1);
    expect((derived as any).observers.length).to.be.eq(0);

    let value = 0;
    const unsub = derived.subscribe(v => value = v);

    expect(count).to.be.eq(2);
    expect(value).to.be.eq(1); expect(derived.value).to.be.eq(1);

    state1.next({ hi: 3 });

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(4); expect(derived.value).to.be.eq(4);

    unsub();

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(4); expect(derived.value).to.be.eq(4);
    expect(count).to.be.eq(4);
  }));

  it('derivation with multiple subscriptions', attempt(() => {

    const state = new rx.State(0);
    const d1 = state.derive(v => v + 1);

    let count = 0;

    const valueChanges = new rx.State(0);

    d1.subscribe(v => { count++; valueChanges.next(v); });
    expect(count).to.be.eq(1);
    expect(valueChanges.value).to.be.eq(1);

    d1.subscribe(v => { count++; valueChanges.next(v); });
    expect(count).to.be.eq(2);
    expect(valueChanges.value).to.be.eq(1);

    state.next(s => s + 1);

    expect(count).to.be.eq(4);
    expect(valueChanges.value).to.be.eq(2);

  }));

  it('derivation with multiple parents', attempt(() => {

    const state1 = new rx.State({ hi: 4 });
    const state2 = new rx.State({ yes: 2 });

    let value = 0;
    let count = 0;
    const derived = rx.derive(
      state1, state2, (s1, s2) => {
        count++;
        return s1.hi + s2.yes;
      }
    );

    expect(count).to.be.eq(0);
    expect((derived as any).observers.length).to.be.eq(0);
    expect(derived.value).to.be.eq(6);
    expect(count).to.be.eq(1);
    expect((derived as any).observers.length).to.be.eq(0);

    const unsub = derived.subscribe(v => value = v);
    expect(count).to.be.eq(2);

    expect(value).to.be.eq(6);
    expect(derived.value).to.be.eq(6);
    expect(count).to.be.eq(2);

    state1.next({ hi: 7 });

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(9);
    expect(derived.value).to.be.eq(9);
    expect(count).to.be.eq(3);

    unsub();

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(9);

    expect(derived.value).to.be.eq(9);
    expect(count).to.be.eq(4);
  }));


  it('chained derivations', attempt(() => {

    const state1 = new rx.State({ hi: 4 });
    const state2 = new rx.State({ yes: 2 });

    let value1 = 0;
    let value2 = 0;
    let count1 = 0;
    let count2 = 0;

    const derived1 = rx.derive(
      state1, state2, (s1, s2) => {
        count1++;
        return s1.hi + s2.yes;
      }
    );

    const derived2 = rx.derive(
      state1, derived1, (st1, se2) => {
        count2++;
        return st1.hi + se2
      }
    );

    expect(count1).to.be.eq(0); expect(count2).to.be.eq(0);
    expect((derived2 as any).observers.length).to.be.eq(0);
    expect((derived1 as any).observers.length).to.be.eq(0);

    expect(derived2.value).to.be.eq(10);

    expect((derived2 as any).observers.length).to.be.eq(0);
    expect((derived1 as any).observers.length).to.be.eq(0);
    expect(count1).to.be.eq(1); expect(count2).to.be.eq(1);

    const unsub2 = derived2.subscribe(v => value2 = v);

    expect((derived2 as any).observers.length).to.be.eq(1);
    expect((derived1 as any).observers.length).to.be.eq(1);
    expect(count1).to.be.eq(2); expect(count2).to.be.eq(2);
    // expect(derived2.value).to.be.eq(10);

    state1.next({ hi: 6 });

    expect(count1).to.be.eq(3); expect(count2).to.be.eq(4);
    expect(value2).to.be.eq(14);

    const unsub1 = derived1.subscribe(v => value1 = v);

    expect(count1).to.be.eq(3); expect(count2).to.be.eq(4);
    expect(value1).to.be.eq(8);

    expect(derived1.value).to.be.eq(8);

    expect(count1).to.be.eq(3); expect(count2).to.be.eq(4);

    unsub2();
    expect((derived2 as any).observers.length).to.be.eq(0);

    unsub1();
    expect((derived2 as any).observers.length).to.be.eq(0);
    expect((derived1 as any).observers.length).to.be.eq(0);
  }));

  it('derivations are multicast', attempt(() => {

    const state1 = new rx.State({ hi: 0 });

    let count = 0;
    const derived = rx.derive(
      state1, s1 => {
        count++;
        return s1.hi + 1;
      }
    );

    derived.subscribe();
    derived.subscribe();

    expect(count).to.be.eq(1);

    state1.next({ hi: 4 });

    expect(count).to.be.eq(2);
  }))


  it('shorthands', attempt(() => {

    const state1 = new rx.State({ hi: 0 });

    let count = 0;
    let value = 0;
    const derived = state1.derive(s1 => {
      count++;
      return s1.hi + 1;
    }).derive(v => v + 1);

    expect(count).to.be.eq(0);
    expect((derived as any).observers.length).to.be.eq(0);
    expect(derived.value).to.be.eq(2);
    expect(count).to.be.eq(1);
    expect((derived as any).observers.length).to.be.eq(0);

    const unsub = derived.subscribe(v => value = v);

    expect(count).to.be.eq(2);
    expect(value).to.be.eq(2); expect(derived.value).to.be.eq(2);

    state1.next({ hi: 3 });

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(5); expect(derived.value).to.be.eq(5);

    unsub();

    expect(count).to.be.eq(3);
    expect(value).to.be.eq(5); expect(derived.value).to.be.eq(5);
    expect(count).to.be.eq(4);
  }))


  it('memoization', attempt(() => {

    const state1 = new rx.State(5);

    let count = 0;
    const derived = state1.derive(s1 => {
      count++;
      return s1 + 1;
    }).derive(v => v + 1);

    expect(count).to.be.eq(0);

    let emissionCount = 0;
    const unsub = derived.subscribe(_ => emissionCount++);

    expect(count).to.be.eq(1); expect(emissionCount).to.be.eq(1);

    state1.next(5);
    state1.next(5);
    state1.next(5);

    expect(count).to.be.eq(1);
    expect(emissionCount).to.be.eq(4);

    state1.next(6);

    expect(count).to.be.eq(2);

    unsub();
  }))

})

