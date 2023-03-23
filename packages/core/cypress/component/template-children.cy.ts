import { Component, h } from "$thispkg"
import { attempt, mount } from "../support/helpers";

describe('template children', () => {

  it('HTM(Div)LElement', attempt(() => {

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
    TemplateChildrenHTMLElementTest.register();

    const comp = mount(TemplateChildrenHTMLElementTest);

    expect(comp.shadowRoot!.innerHTML.trim()).to.contain((
      '<span> <div>div1</div> <span>span1</span> </span>'
      + '<span> <div>div2</div> </span>'
    ).replaceAll(' ', ''));
  }))

  it('custom', attempt(async () => {

    class TemplateChildrenCustomTestChild extends Component {
      render() {
        return [ h.slot() ]
      }
    }
    TemplateChildrenCustomTestChild.register();

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
    TemplateChildrenCustomTest.register();

    const comp = mount(TemplateChildrenCustomTest);

    const html = comp.shadowRoot!.innerHTML.trim();
    expect(html).to.contain('</summary>');
    expect(html).to.contain('custom child');

    expect(getComputedStyle((await comp.query('summary'))).backgroundColor)
      .to.be.eq('rgb(255, 0, 0)');


  }))

})
