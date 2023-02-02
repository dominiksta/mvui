import { test, expect } from '@jest/globals';
import Component from "component";
import Html from "html";
import { testDoc, waitFrame } from './util';

class TemplateReferencesTest1 extends Component {

  private paragraphEl = this.query<HTMLParagraphElement>('.myClass');
  private listEls = this.queryAll<HTMLParagraphElement>('.myListEl');

  async onRender() {
    (await this.paragraphEl).innerText = 'Programatically added content';
    for (let el of (await this.listEls)) {
      el.innerText = 'Multiple query';
      el.style.textDecoration = 'underline';
    }
  }

  render = () => [
    Html.FieldSet([
      Html.Legend('Template References'),
      Html.P({ attrs: { class: 'myClass' } }),
      Html.Ul([
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
}
TemplateReferencesTest1.register();


class TemplateReferencesTest2 extends Component {

  render = () => [
    Html.FieldSet([
      Html.Legend('Template References'),
      Html.P(
        'This component contains elements with same css classes as another ' +
        'component, so if the shadow were not working the elements here would ' +
        'be populated and styled'
      ),
      Html.P({ attrs: { class: 'myClass' } }),
      Html.Ul([
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
}
TemplateReferencesTest2.register();

test('template references', async () => {
  const comp1 = testDoc(new TemplateReferencesTest1())[1];
  const comp2 = testDoc(new TemplateReferencesTest2())[1];
  await waitFrame();

  for (let li of (await comp1.queryAll<HTMLLIElement>('.myListEl'))) {
    expect(li.innerText).toBe('Multiple query');
    expect(li.style.textDecoration).toBe('underline');
  }

  for (let li of (await comp2.queryAll<HTMLLIElement>('.myListEl'))) {
    expect(li.innerText).toBe(undefined);
    expect(li.style.textDecoration).toBe('');
  }
});
