import { test, expect } from '@jest/globals';
import Component from "component";
import h from "html";
import { testDoc, waitFrame } from './util';

class TemplateReferencesTest1 extends Component {

  private paragraphEl = this.query<HTMLParagraphElement>('.myClass');
  private listEls = this.queryAll<HTMLParagraphElement>('.myListEl');

  async onRender() {
    (await this.paragraphEl).innerText = 'Programatically added content';
    for (let el of Array.from(await this.listEls)) {
      el.innerText = 'Multiple query';
      el.style.textDecoration = 'underline';
    }
  }

  render = () => [
    h.fieldset([
      h.legend('Template References'),
      h.p({ attrs: { class: 'myClass' } }),
      h.ul([
        h.li({ attrs: { class: 'myListEl' }}),
        h.li({ attrs: { class: 'myListEl' }}),
        h.li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
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

test('template references', async () => {
  const comp1 = testDoc(new TemplateReferencesTest1())[1];
  const comp2 = testDoc(new TemplateReferencesTest2())[1];
  await waitFrame();

  for (let li of Array.from(await comp1.queryAll<HTMLLIElement>('.myListEl'))) {
    expect(li.innerText).toBe('Multiple query');
    expect(li.style.textDecoration).toBe('underline');
  }

  for (let li of Array.from(await comp2.queryAll<HTMLLIElement>('.myListEl'))) {
    expect(li.innerText).toBe(undefined);
    expect(li.style.textDecoration).toBe('');
  }
});
