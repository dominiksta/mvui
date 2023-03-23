import { Component, h } from "$thispkg"
import { mount } from "../support/helpers";

describe('template children', () => {

  it('HTM(Div)LElement', () => {

    class TemplateChildrenHTMLElementTest extends Component {
      render() {
        const div1 = document.createElement('div');
        div1.innerText = 'div1';

        const div2 = document.createElement('div');
        div2.innerText = 'div2';

        const div3 = document.createElement('div');
        div3.innerText = 'div3';


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
  })

})
