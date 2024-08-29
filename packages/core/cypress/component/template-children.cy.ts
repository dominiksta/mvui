import { Component, h, rx } from "$thispkg"
import { getContainerEl } from "@cypress/mount-utils";
import { attempt, mount } from "../support/helpers";
import { getActiveElement } from '../../src/util/dom';

describe('template children', () => {

  // ======================================================================
  it('HTM(Div)Element', attempt(() => {

    @Component.register
    class TemplateChildrenHTMLElementTest extends Component {
      render() {
        const div1 = document.createElement('div');
        div1.innerText = 'div1';

        const div2 = document.createElement('div');
        div2.innerText = 'div2';


        return [
          h.span([ div1, h.span('span1') ]),
          h.span(div2),
        ]
      }
    }

    const comp = mount(TemplateChildrenHTMLElementTest);

    expect(comp.shadowRoot!.innerHTML.trim()).to.contain((
      '<span> <div>div1</div> <span>span1</span> </span>'
      + '<span> <div>div2</div> </span>'
    ).replaceAll(' ', ''));
  }))

  it('custom', attempt(async () => {

    @Component.register
    class TemplateChildrenCustomTestChild extends Component {
      render() {
        return [ h.slot() ]
      }
    }

    @Component.register
    class TemplateChildrenCustomTest extends Component {
      render() {
        return [
          h.span([
            h.custom('summary')(
              { style: { background: 'red' } },
              'custom child'
            ),
            h.custom(TemplateChildrenCustomTestChild)(
              'custom child 2'
            ),

            // this element should compile even though it is technically nonsense, but
            // this untyped syntax is useful for using third party web components without
            // having to provide types yourself (if you are in a hurry or just really dont
            // care)
            h.custom('not-an-actual-component')({
              events: { 'alskdjasl': () => null, },
              fields: { 'liauzlsduk': 4, },
            },
              'custom child 3'
            ),
          ]),
        ]
      }
    }

    const comp = mount(TemplateChildrenCustomTest);

    const html = comp.shadowRoot!.innerHTML.trim();
    expect(html).to.contain('</summary>');
    expect(html).to.contain('custom child');

    expect(getComputedStyle((await comp.query('summary'))).backgroundColor)
      .to.be.eq('rgb(255, 0, 0)');


  }))

  // ======================================================================
  it('fragments', attempt(async () => {
    @Component.register
    class WithFragments extends Component {
      render() {
        const state = new rx.State(['one', 'two']);

        return [
          h.button({
            events: { click: _ => state.next(v => [...v, 'three' ]) }
          }, 'change state'),
          h.br(),
          h.div('before'),
          h.fragment(state, s => s.map(v => h.div(v))),
          h.div('after'),
          h.br(),
          h.div([
            h.fragment(state, s => s.map(v => h.div(v))),
            h.div('nest_between'),
            h.fragment(state, s => s.map(v => h.div(v))),
            h.fragment(state, s => s.map(v => h.div(v))),
            h.div('nest_after'),
          ]),
          h.br(),
          h.div([
            h.div('nest2_before'),
            h.div(
              // doesnt make much sense but should work anyway
              h.fragment(state, s => s.map(v => h.div(h.span(v))))
            ),
            h.div('nest2_after'),
          ]),
          h.br(),
          h.div([
            h.div('nest3_before'),
            // h.fragment(rx.combineLatest(state, state), ([s, v2]) => )

            h.fragment(state, s => s.map(v => h.div([
              h.fragment(state, s => s.map(v2 => h.div(`${v}_${v2}`))),
              h.div('between'),
              h.fragment(state, s => s.map(v2 => h.div(`${v}_${v2}`))),
              h.fragment(state, s => s.map(v2 => h.div(`${v}_${v2}`))),
            ]))),
            h.div('nest3_after'),
          ]),
          h.br(),
        ]
      }
    }

    const comp = mount(WithFragments);

    const btn = await comp.query<HTMLButtonElement>('button');

    expect(comp.shadowRoot!.innerHTML.trim()).to.contain(`
      <div>before</div>
      <div>one</div>
      <div>two</div>
      <div>after</div>
      <br>
      <div>
        <div>one</div>
        <div>two</div>
        <div>nest_between</div>
        <div>one</div>
        <div>two</div>
        <div>one</div>
        <div>two</div>
        <div>nest_after</div>
      </div>
      <br>
      <div>
        <div>nest2_before</div>
        <div>
          <div><span>one</span></div>
          <div><span>two</span></div>
        </div>
        <div>nest2_after</div>
      </div>
      <br>
      <div>
        <div>nest3_before</div>
        <div>
          <div>one_one</div>
          <div>one_two</div>
          <div>between</div>
          <div>one_one</div>
          <div>one_two</div>
          <div>one_one</div>
          <div>one_two</div>
        </div>
        <div>
          <div>two_one</div>
          <div>two_two</div>
          <div>between</div>
          <div>two_one</div>
          <div>two_two</div>
          <div>two_one</div>
          <div>two_two</div>
        </div>
        <div>nest3_after</div>
      </div>
    `.replaceAll(' ', '').replaceAll('\n', ''));

    btn.click();

    expect(comp.shadowRoot!.innerHTML.trim()).to.contain(`
      <div>before</div>
      <div>one</div> <div>two</div> <div>three</div>
      <div>after</div>
      <br>
      <div>
        <div>one</div> <div>two</div> <div>three</div>
        <div>nest_between</div>
        <div>one</div> <div>two</div> <div>three</div>
        <div>one</div> <div>two</div> <div>three</div>
        <div>nest_after</div>
      </div>
      <br>
      <div>
        <div>nest2_before</div>
        <div>
          <div><span>one</span></div>
          <div><span>two</span></div>
          <div><span>three</span></div>
        </div>
        <div>nest2_after</div>
      </div>
      <br>
      <div>
        <div>nest3_before</div>
        <div>
          <div>one_one</div> <div>one_two</div> <div>one_three</div>
          <div>between</div>
          <div>one_one</div> <div>one_two</div> <div>one_three</div>
          <div>one_one</div> <div>one_two</div> <div>one_three</div>
        </div>
        <div>
          <div>two_one</div> <div>two_two</div> <div>two_three</div>
          <div>between</div>
          <div>two_one</div> <div>two_two</div> <div>two_three</div>
          <div>two_one</div> <div>two_two</div> <div>two_three</div>
        </div>
        <div>
          <div>three_one</div> <div>three_two</div> <div>three_three</div>
          <div>between</div>
          <div>three_one</div> <div>three_two</div> <div>three_three</div>
          <div>three_one</div> <div>three_two</div> <div>three_three</div>
        </div>
        <div>nest3_after</div>
      </div>
    `.replaceAll(' ', '').replaceAll('\n', ''));


  }))

  // ======================================================================
  it('foreach: trackBy unique', attempt(async () => {
    type ListElT = { k: string, v: string};
    type ListT = ListElT[];

    @Component.register
    class ForeachTrackbyUnique extends Component {
      render() {
        const initial: ListT = [
          { k: '1', v: 'one' }, { k: '2', v: 'two' }, { k: '3', v: 'three' }
        ];
        const list = new rx.State(structuredClone(initial));

        const updateValInList = (k: string, v: string) => {
          list.value.find((el: { k: string, v: string }) => el.k === k)!.v = v;
          console.debug(`${k} -> ${v}`);
          list.next((l: ListT) => [...l]);
        }

        return [
          h.button({
            fields: { id: 'add' },
            events: { click: _ => list.next((l: ListT) => [...l, { k: '4', v: 'four' }]) }
          }, 'add'),
          h.button({
            fields: { id: 'rm2' },
            events: { click: _ => list.next((l: ListT) => [
              ...l.slice(0, 1), ...l.slice(2)
            ]) }
          }, 'rm2'),
          h.button({
            fields: { id: 'reset' },
            events: { click: _ => list.next(structuredClone(initial)) }
          }, 'reset'),
          h.section(
            h.foreach(list, 'pos', (el: rx.DerivedState<ListElT>) => h.div([
              h.input(
                {
                  fields: {
                    id: el.derive(el => `input-${el.k}`),
                    value: el.derive((e: ListElT) => {
                      // console.warn('val: ', e.v);
                      return e.v;
                    })
                  },
                  events: {
                    keyup: e => {
                      console.log('keyup');
                      updateValInList(
                        el.value.k, (e.target! as HTMLInputElement).value
                      );
                    }
                  }
                }
              ),
              h.span(h.pre(el.derive(el => el.v))),
            ]))
          ),
          h.div(h.pre(list.derive(v => JSON.stringify(v, null, 2)))),
        ]
      }
    }

    const comp = mount(ForeachTrackbyUnique);

    const btnAdd = await comp.query<HTMLButtonElement>('#add');
    const btnRm2 = await comp.query<HTMLButtonElement>('#rm2');
    const btnReset = await comp.query<HTMLButtonElement>('#reset');

    const getInput =
      async (n: number) => await comp.query<HTMLInputElement>(`#input-${n}`);

    const getInputs =
      async (ids: number[]): Promise<{ [key: number]: HTMLInputElement }> => {
        const btns = await Promise.all(ids.map(getInput))
        const ret: { [key: number]: HTMLInputElement } = {};
        for (let i = 0; i < ids.length; i++) ret[ids[i]] = btns[i];
        return ret;
      };

    const edit = (el: HTMLInputElement, val: string) => {
      el.focus();
      el.value = val;
      el.dispatchEvent(new KeyboardEvent('keyup'));
    }

    const values = (els: { [key: number]: HTMLInputElement }) =>
      Object.values(els).map(el => el.value);

    {
      let inputs = await getInputs([1, 2, 3]);
      console.log(inputs);

      expect(values(inputs)).to.deep.eq([ 'one', 'two', 'three' ], 'initial');

      edit(inputs[1], 'one-edit');
      expect(values(inputs))
        .to.deep.eq([ 'one-edit', 'two', 'three' ], 'basic edit');
      expect(getActiveElement()).to.eq(inputs[1], 'retain focus');

      btnAdd.click();
      inputs = await getInputs([1, 2, 3, 4]);
      expect(values(inputs))
        .to.deep.eq([ 'one-edit', 'two', 'three', 'four' ], 'add element');

      edit(inputs[4], 'four-edit');
      edit(inputs[3], 'three-edit');
      edit(inputs[2], 'two-edit');

      expect(values(inputs))
        .to.deep.eq([ 'one-edit', 'two-edit', 'three-edit', 'four-edit' ], 'edit all');

      btnRm2.click();
      inputs = await getInputs([1, 3, 4]);
      expect(values(inputs))
        .to.deep.eq([ 'one-edit', 'three-edit', 'four-edit' ], 'remove 2');
      getInputs([2]).then(_ => { throw 'el should not exist'; }).catch(_ => null);

      btnRm2.click();
      inputs = await getInputs([1, 4]);
      expect(values(inputs))
        .to.deep.eq([ 'one-edit', 'four-edit' ], 'remove 2');
      getInputs([2]).then(_ => { throw 'el should not exist'; }).catch(_ => null);
      getInputs([3]).then(_ => { throw 'el should not exist'; }).catch(_ => null);

      btnReset.click();
      inputs = await getInputs([1, 2, 3]);
      getInputs([4]).then(_ => { throw 'el should not exist'; }).catch(_ => null);
      expect(values(inputs))
        .to.deep.eq([ 'one', 'two', 'three' ], 'reset');
    }


  }));


  // ======================================================================
  it('foreach: pos', attempt(async () => {
    const numbers: { [n: number]: string } = {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
    }

    @Component.register
    class ForeachTrackByPos extends Component {
      render() {
        const initial: string[] = [1, 2, 3].map(n => numbers[n]);
        const list = new rx.State(structuredClone(initial));

        return [
          h.button({
            fields: { id: 'add' },
            events: {
              click: _ => list.next((l: string[]) => [...l, numbers[l.length + 1]])
            }
          }, 'add'),
          h.button({
            fields: { id: 'rm2' },
            events: { click: _ => list.next((l: string[]) => [
              ...l.slice(0, 1), ...l.slice(2)
            ]) }
          }, 'rm2'),
          h.button({
            fields: { id: 'reset' },
            events: { click: _ => list.next(structuredClone(initial)) }
          }, 'reset'),
          h.section(
            { fields: { id: 'inputs' }},
            h.foreach(list, 'pos', (el: rx.DerivedState<string>, i) => h.div([
              h.input(
                {
                  fields: {
                    id: el.derive(el => `input-${el}`),
                    value: el.derive(e => {
                      // console.warn('val: ', e);
                      return e;
                    })
                  },
                  events: {
                    keyup: e => {
                      list.value[i] = (e.target as HTMLInputElement).value;
                      list.next((l: string[]) => [...l]);
                      console.log('keyup');
                    }
                  }
                }
              ),
              h.span(h.pre(el)),
            ]))
          ),
          h.div(h.pre(list.derive(v => JSON.stringify(v, null, 2)))),
        ]
      }
    }

    const comp = mount(ForeachTrackByPos);

    const btnAdd = await comp.query<HTMLButtonElement>('#add');
    const btnRm2 = await comp.query<HTMLButtonElement>('#rm2');
    const btnReset = await comp.query<HTMLButtonElement>('#reset');

    const sectionInputs = await comp.query(`#inputs`);

    const getInput = (n: number) =>
      sectionInputs.children[n].children[0] as HTMLInputElement;

    const edit = (el: HTMLInputElement, val: string) => {
      el.focus();
      el.value = val;
      el.dispatchEvent(new KeyboardEvent('keyup'));
    }

    {
      let inputs = [0, 1, 2].map(getInput);
      expect(inputs.map(i => i.value))
        .to.deep.eq(['one', 'two', 'three'], 'initial');
      expect(sectionInputs.children.length).to.eq(3);

      edit(inputs[0], 'one-edit');
      expect(inputs.map(i => i.value))
        .to.deep.eq(['one-edit', 'two', 'three'], 'simple-edit');
      expect(getActiveElement()).to.eq(inputs[0], 'keep focus');


      btnAdd.click();
      inputs = [0, 1, 2, 3].map(getInput);

      expect(sectionInputs.children.length).to.eq(4);
      expect(inputs.map(i => i.value))
        .to.deep.eq(['one-edit', 'two', 'three', 'four'], 'add');

      edit(inputs[1], 'two-edit');
      edit(inputs[2], 'three-edit');
      edit(inputs[3], 'four-edit');

      expect(inputs.map(i => i.value)).to.deep.eq(
        ['one-edit', 'two-edit', 'three-edit', 'four-edit'], 'edit after add'
      );

      btnRm2.click();
      inputs = [0, 1, 2].map(getInput);

      expect(sectionInputs.children.length).to.eq(3);
      expect(inputs.map(i => i.value)).to.deep.eq(
        ['one-edit', 'three-edit', 'four-edit'], 'rm2'
      );

      btnRm2.click();
      inputs = [0, 1].map(getInput);

      expect(sectionInputs.children.length).to.eq(2);
      expect(inputs.map(i => i.value)).to.deep.eq(['one-edit', 'four-edit'], 'rm2');

      edit(inputs[1], 'four-edit-2');

      expect(inputs.map(i => i.value)).to.deep.eq(
        ['one-edit', 'four-edit-2'], 'edit after remove'
      );

      btnReset.click();
      inputs = [0, 1, 2].map(getInput);

      expect(inputs.map(i => i.value)).to.deep.eq(['one', 'two', 'three'], 'reset');

      btnRm2.click();
      btnAdd.click();
      inputs = [0, 1, 2].map(getInput);

      expect(inputs.map(i => i.value)).to.deep.eq(['one', 'three', 'three'], 'double');

      edit(inputs[1], 'three-one-edit');
      edit(inputs[2], 'three-two-edit');

      expect(inputs.map(i => i.value))
        .to.deep.eq(['one', 'three-one-edit', 'three-two-edit'], 'double edit');
    }
  }));

})
