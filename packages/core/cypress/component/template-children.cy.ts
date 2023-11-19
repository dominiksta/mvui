import { Component, h, rx } from "$thispkg"
import { attempt, mount } from "../support/helpers";

describe('template children', () => {

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

})
