import { test, expect } from '@jest/globals';
import Component from "component";
import * as h from "html";
import { testDoc } from './util';

class MyLayout extends Component {
  render = () => [
    h.div('"Header"'),
    h.div(h.slot({ attrs: { id: 'header' }})),
    h.div('"Footer"'),
    h.slot({ attrs: { id: 'footer', name: "after-footer" } }),
  ]
}
MyLayout.register();

export class SlotsTest extends Component {
  render = () => [
    h.fieldset([
      h.legend('Slots'),
      MyLayout.new([
        h.div('Content Children'),
        h.div('Content Children 2'),
        h.div({ attrs: { slot: "after-footer" } }, 'After Footer'),
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
