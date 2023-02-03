import { test, expect } from '@jest/globals';
import Component from "component";
import Html from "html";
import { testDoc } from './util';

class MyLayout extends Component {
  render = () => [
    Html.div('"Header"'),
    Html.div(Html.slot({ attrs: { id: 'header' }})),
    Html.div('"Footer"'),
    Html.slot({ attrs: { id: 'footer', name: "after-footer" } }),
  ]
}
MyLayout.register();

export class SlotsTest extends Component {
  render = () => [
    Html.fieldset([
      Html.legend('Slots'),
      MyLayout.new([
        Html.div('Content Children'),
        Html.div('Content Children 2'),
        Html.div({ attrs: { slot: "after-footer" } }, 'After Footer'),
      ])
    ])
  ]
}
SlotsTest.register();

test('slots', async () => {
  const [_, comp] = testDoc(new SlotsTest());
  const layout = await comp.query<MyLayout>('mvui-my-layout');

  const header = layout.shadowRoot?.children[1].children[0] as HTMLSlotElement;
  const headerEls = (header.assignedElements() as HTMLDivElement[]);

  const footer = layout.shadowRoot?.children[3] as HTMLSlotElement;;
  const footerEls = (footer.assignedElements() as HTMLDivElement[]);

  expect(headerEls[0].innerText).toContain('Content Children');
  expect(headerEls[1].innerText).toContain('Content Children 2');

  expect(footerEls[0].innerText).toContain('After Footer');
});
