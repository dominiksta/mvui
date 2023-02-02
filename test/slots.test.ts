import { test, expect } from '@jest/globals';
import Component from "component";
import Html from "html";
import { testDoc } from './util';

class MyLayout extends Component {
  render = () => [
    Html.Div('"Header"'),
    Html.Div(Html.Slot({ attrs: { id: 'header' }})),
    Html.Div('"Footer"'),
    Html.Slot({ attrs: { id: 'footer', name: "after-footer" } }),
  ]
}
MyLayout.register();

export class SlotsTest extends Component {
  render = () => [
    Html.FieldSet([
      Html.Legend('Slots'),
      MyLayout.new([
        Html.Div('Content Children'),
        Html.Div('Content Children 2'),
        Html.Div({ attrs: { slot: "after-footer" } }, 'After Footer'),
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
