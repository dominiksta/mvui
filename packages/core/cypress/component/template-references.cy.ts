import { Component, h } from "@mvui/core";
import { mount, waitFrame } from "../support/helpers";

class TemplateReferencesTest1 extends Component {

  private paragraphEl = this.query<HTMLParagraphElement>('.myClass');
  private listEls = this.queryAll<HTMLParagraphElement>('.myListEl');

  render() {
    this.onRender(async () => {
      (await this.paragraphEl).innerText = 'Programatically added content';
      for (let el of Array.from(await this.listEls)) {
        el.innerText = 'Multiple query';
        el.style.textDecoration = 'underline';
      }
    });

    return [
      h.fieldset([
        h.legend('Template References'),
        h.p({ attrs: { class: 'myClass' } }),
        h.ul([
          h.li({ attrs: { class: 'myListEl' } }),
          h.li({ attrs: { class: 'myListEl' } }),
          h.li({ attrs: { class: 'myListEl' } }),
        ])
      ])
    ];
  }
}
TemplateReferencesTest1.register();

class TemplateReferencesTest2 extends Component {

  render = () => [
    h.fieldset([
      h.legend('Template References'),
      h.p(
        'This component contains elements with same css classes as another ' +
        'component, so if the shadow were not working the elements here would ' +
        'be populated and styled'
      ),
      h.p({ attrs: { class: 'myClass' } }),
      h.ul([
        h.li({ attrs: { class: 'myListEl' }}),
        h.li({ attrs: { class: 'myListEl' }}),
        h.li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
}
TemplateReferencesTest2.register();

describe('Template References', function() {
  it('kinda work', async function() {
    const comp1 = mount(TemplateReferencesTest1);
    const comp2 = mount(TemplateReferencesTest2);

    await waitFrame();

    for (let li of Array.from(await comp1.queryAll<HTMLLIElement>('.myListEl'))) {
      expect(li.innerText).to.be.eq('Multiple query');
      expect(li.style.textDecoration).to.be.eq('underline');
    }

    for (let li of Array.from(await comp2.queryAll<HTMLLIElement>('.myListEl'))) {
      expect(li.innerText).to.be.eq('');
      expect(li.style.textDecoration).to.be.eq('');
    }
  });
})
