import { Component, h, rx } from "$thispkg"
import { mount, sleep, waitFrame } from "../../support/helpers";

describe('Stores', () => {
  it('basic state changes & selectors without subscription', () => {

    const store = new rx.Store({
      initialState: { p1: 4, p2: 'hi' },
      reducers: {
        lower: v => ({ ...v, p2: v.p2.toLowerCase() }),
        upper: v => ({ ...v, p2: v.p2.toUpperCase() }),
        concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
      },
      selectors: {
        appendWorld: v => v.p2 + ' World',
      }
    });

    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'hi' });
    expect(store.select.appendWorld.value).to.eq('hi World');

    store.reduce.upper();

    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'HI' });
    expect(store.select.appendWorld.value).to.eq('HI World');
    
    store.dispatch({ type: 'lower' });

    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'hi' });
    expect(store.select.appendWorld.value).to.eq('hi World');

    store.reduce.concat(' dear');

    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'hi dear' });
    expect(store.select.appendWorld.value).to.eq('hi dear World');
  });

  it('partial', () => {

    const store = new rx.Store({
      initialState: { p1: 4, p2: 'hi', deep: { nesting: 7 } },
      reducers: {
        lower: v => ({ ...v, p2: v.p2.toLowerCase() }),
        upper: v => ({ ...v, p2: v.p2.toUpperCase() }),
        concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
      },
    });

    expect(store.partial('p2').value).to.eq('hi');
    expect(store.partial('deep', 'nesting').value).to.eq(7);
    expect(store.value.p2).to.eq('hi');
    expect(store.partial('p1').value).to.eq(4);
    
    store.partial('p2').next('ye');
    store.partial('deep', 'nesting').next(1337);

    expect(store.partial('p2').value).to.eq('ye');
    expect(store.partial('deep', 'nesting').value).to.eq(1337);
    expect(store.value.p2).to.eq('ye');
    expect(store.value.deep.nesting).to.eq(1337);
    expect(store.partial('p1').value).to.eq(4);
  });

  it('multicast & effect setup', () => {

    const store = new rx.Store({
      initialState: 0,
      reducers: {
        inc: v => v + 1,
      },
    });

    let effectCalled = 0;
    const effect = store.effect(
      (reduce, payload: rx.Stream<void>) => payload.pipe(
        rx.tap(_ => {
          effectCalled++;
          reduce.inc();
        })
      )
    );

    const unsub: (() => void)[] = [];

    const effect2 = store.effect(
      (reduce, payload: rx.Stream<void>) => payload.pipe(
        rx.tap(_ => {
          effectCalled++;
          reduce.inc();
        })
      )
    );

    unsub.push(store.subscribe());
    unsub.push(store.subscribe());
    unsub.push(store.subscribe());

    effect();

    expect(effectCalled).to.eq(1);
    expect(store.state.value).to.eq(1);

    effect2();

    expect(effectCalled).to.eq(2);
    expect(store.state.value).to.eq(2);

    effect();
    effect2();

    expect(effectCalled).to.eq(4);
    expect(store.state.value).to.eq(4);

    for (const u of unsub) u();

    effect();
    effect2();

    expect(effectCalled).to.eq(4);
    expect(store.state.value).to.eq(4);
  });

  it('basic state changes & selectors with subscription', () => {

    const store = new rx.Store({
      initialState: { p1: 4, p2: 'hi' },
      reducers: {
        lower: v => ({ ...v, p2: v.p2.toLowerCase() }),
        upper: v => ({ ...v, p2: v.p2.toUpperCase() }),
        concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
      },
      selectors: {
        appendWorld: v => v.p2 + ' World',
      }
    });

    let value = store.state.value;
    store.subscribe(v => { value = v });
    
    let appendWorldValue = store.select.appendWorld.value;
    store.select.appendWorld.subscribe(v => { appendWorldValue = v });

    expect(value).to.deep.eq({ p1: 4, p2: 'hi' });
    expect(appendWorldValue).to.eq('hi World');
    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'hi' });
    expect(store.select.appendWorld.value).to.eq('hi World');

    store.reduce.upper();

    expect(value).to.deep.eq({ p1: 4, p2: 'HI' });
    expect(appendWorldValue).to.eq('HI World');
    
    store.dispatch({ type: 'lower' });

    expect(value).to.deep.eq({ p1: 4, p2: 'hi' });
    expect(appendWorldValue).to.eq('hi World');

    store.reduce.concat(' dear');

    expect(value).to.deep.eq({ p1: 4, p2: 'hi dear' });
    expect(appendWorldValue).to.eq('hi dear World');
    expect(store.state.value).to.deep.eq({ p1: 4, p2: 'hi dear' });
    expect(store.select.appendWorld.value).to.eq('hi dear World');
  });

  it('effects', async () => {

    const store = new rx.Store({
      initialState: { p1: 4, p2: 'hi' },
      reducers: { }
    });

    const effect = store.effect((reduce, payload: rx.Stream<string>) => payload.pipe(
      // rx.tap(v => console.log('input: ', v)),
      rx.distinctUntilChanged(),
      rx.switchMap(payload => rx.timer(10).pipe(rx.map(_ => {
        // console.log('timer');
        return payload;
      }))),
      rx.tap(v => {
        // console.log('setting: ', v);
        reduce.patch({p2: v});
      }),
    ));

    expect(store.state.value.p2).to.eq('hi');
    effect('one');
    expect(store.state.value.p2).to.eq('hi');
    await sleep(20);
    expect(store.state.value.p2, 'without subscription nothing happens').to.eq('hi');
    store.subscribe();

    effect('one');
    expect(store.state.value.p2).to.eq('hi');
    await sleep(20);
    expect(store.state.value.p2).to.eq('one');
    effect('two');
    await sleep(20);
    expect(store.state.value.p2).to.eq('two');

  });
  

  it('attaching to component lifecycle', async () => {
    @Component.register
    class StoreComponent extends Component {
      render() {
        // console.log('render');
        const store = new rx.Store({
          initialState: { p1: 4, p2: 'hi', deep: { nesting: 'ye' }},
          reducers: {
            concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
          },
        });
        this.subscribe(store);

        const effect = store.effect(
          (reduce, payload: rx.Stream<void>) => payload.pipe(
            rx.delay(10),
            rx.tap(_ => {
              // console.log('effect');
              reduce.concat(' effect');
            })
          )
        );

        return [
          h.span({ fields: { id: 'text' }}, store.state.derive(v => v.p2)),
          h.button({
            fields: { id: 'add-plain' },
            events: { click: _ => {
              store.reduce.concat(' plain');
            }}
          }, 'Add "plain"'),
          h.button({
            fields: { id: 'add-effect' },
            events: { click: _ => {
              effect();
            }}
          }, 'Add "effect"'),

          h.input({
            fields: { value: rx.bind(store.partial('deep', 'nesting')) }
          }),
        ]
      }
    }

    const comp = mount(StoreComponent);
    const addEffect = await comp.query<HTMLButtonElement>('#add-effect');
    const addPlain = await comp.query<HTMLButtonElement>('#add-plain');
    const text = await comp.query<HTMLSpanElement>('#text');

    expect(text.innerText).to.eq('hi');
    addPlain.click();
    await waitFrame();
    expect(text.innerText).to.eq('hi plain');

    addEffect.click();
    await sleep(20);
    expect(text.innerText).to.eq('hi plain effect');

  });

  it('partial bindings in component', async () => {
    let bindVal = '';

    @Component.register
    class PartialBindingsStoreComponent extends Component {
      render() {
        // console.log('render');
        const store = new rx.Store({
          initialState: { p1: 4, p2: 'hi', deep: { nesting: 'ye' }},
          reducers: {
            concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
          },
        });
        this.subscribe(store);

        store.subscribe(v => bindVal = v.deep.nesting);

        return [
          h.span({ fields: { id: 'text' }}, store.partial('deep', 'nesting')),
          h.input({
            fields: { value: rx.bind(store.partial('deep', 'nesting')) }
          }),
        ]
      }
    }

    const comp = mount(PartialBindingsStoreComponent);
    const input = await comp.query<HTMLInputElement>('input');
    const text = await comp.query<HTMLSpanElement>('#text');

    expect(input.value).to.eq('ye');
    expect(bindVal).to.eq('ye');
    expect(text.innerText).to.eq('ye');

    input.value = 'new';
    input.dispatchEvent(new Event('change'));
    expect(text.innerText).to.eq('new');
    expect(bindVal).to.eq('new');

    input.value = 'new2';
    input.dispatchEvent(new Event('change'));
    expect(text.innerText).to.eq('new2');
    expect(bindVal).to.eq('new2');
  });
})
