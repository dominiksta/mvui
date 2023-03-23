import { Component, h, define } from "$thispkg";
import { attempt, mount } from "../support/helpers";

class MyLayout extends Component<{
  slots: {
    'after-footer': any,
    'only-divs': HTMLDivElement,
  }
}
> {
  render = () => [
    h.div('"Header"'),
    h.div(h.slot({ attrs: { id: 'header' } })),
    h.div('"Footer"'),
    h.slot({ attrs: { id: 'footer', name: "after-footer" } }),
    h.slot({ attrs: { id: 'only-divs', name: "only-divs" } }),
  ]
}
const [myLayout] = define(MyLayout);

export class SlotsTest extends Component {
  render = () => [
    h.fieldset([
      h.legend('Slots'),
      myLayout({
        slots: { 'after-footer': 'After Footer', 'only-divs': h.div() }
      }, [
        h.div('Content Children'),
        h.div('Content Children 2'),
      ])
    ])
  ]
}
SlotsTest.register();

describe('Slots', function() {
  it('kinda work', attempt(async () => {
    const comp = mount(SlotsTest);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const header = layout.shadowRoot?.children[1].children[0] as HTMLSlotElement;
    const headerEls = (header.assignedElements() as HTMLDivElement[]);

    const footer = layout.shadowRoot?.children[3] as HTMLSlotElement;;
    const footerEls = (footer.assignedElements() as HTMLDivElement[]);

    expect(headerEls[0].innerText).to.contain('Content Children');
    expect(headerEls[1].innerText).to.contain('Content Children 2');

    expect(footerEls[0].innerText).to.be.eq('After Footer');
  }))

  it('multiple children in default slot', attempt(async () => {
    class TestSlotDefaultMultipleMixed extends Component {
      render() {
        return [
          myLayout([h.div('yes'), 'very much']),
        ]
      }
    }
    TestSlotDefaultMultipleMixed.register();

    const comp = mount(TestSlotDefaultMultipleMixed);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const header = layout.shadowRoot?.children[1].children[0] as HTMLSlotElement;
    const headerEls = (header.assignedNodes() as HTMLElement[]);

    expect(headerEls[0].innerHTML).to.contain('yes');
    expect(headerEls[1].textContent).to.contain('very much');
  }))

  it('multiple string children in default slot', attempt(async () => {
    class TestSlotDefaultMultipleString extends Component {
      render() {
        return [
          myLayout(['yes', 'very much']),
        ]
      }
    }
    TestSlotDefaultMultipleString.register();

    const comp = mount(TestSlotDefaultMultipleString);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const header = layout.shadowRoot?.children[1].children[0] as HTMLSlotElement;
    const headerEls = (header.assignedNodes() as HTMLElement[]);

    expect(headerEls[0].textContent).to.contain('yes');
    expect(headerEls[1].textContent).to.contain('very much');
  }))

  it('multiple element children in default slot', attempt(async () => {
    class TestSlotDefaultMultipleElement extends Component {
      render() {
        return [
          myLayout([h.div('yes'), h.span('very much')]),
        ]
      }
    }
    TestSlotDefaultMultipleElement.register();

    const comp = mount(TestSlotDefaultMultipleElement);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const header = layout.shadowRoot?.children[1].children[0] as HTMLSlotElement;
    const headerEls = (header.assignedNodes() as HTMLElement[]);

    expect(headerEls[0].innerText).to.contain('yes');
    expect(headerEls[1].innerText).to.contain('very much');
  }))

  it('multiple children in named slot', attempt(async () => {
    class TestSlotNamedMultipleMixed extends Component {
      render() {
        return [
          myLayout({
            slots: { 'after-footer': [h.div('yes'), 'very much'] }
          }),
        ]
      }
    }
    TestSlotNamedMultipleMixed.register();

    const comp = mount(TestSlotNamedMultipleMixed);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const footer = layout.shadowRoot?.children[3] as HTMLSlotElement;;
    const footerEls = (footer.assignedElements() as HTMLElement[]);

    expect(footerEls[0].innerText).to.contain('yes');
    expect(footerEls[0].innerText).to.contain('very much');
  }))

  it('multiple string only children in named slot', attempt(async () => {
    class TestSlotNamedMultipleString extends Component {
      render() {
        return [
          myLayout({
            slots: { 'after-footer': ['yes', 'very much'] }
          }),
        ]
      }
    }
    TestSlotNamedMultipleString.register();

    const comp = mount(TestSlotNamedMultipleString);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const footer = layout.shadowRoot?.children[3] as HTMLSlotElement;;
    const footerEls = (footer.assignedElements() as HTMLElement[]);

    expect(footerEls[0].innerText).to.contain('yes');
    expect(footerEls[0].innerText).to.contain('very much');
  }))

  it('multiple element only children in named slot', attempt(async () => {
    class TestSlotNamedMultipleElement extends Component {
      render() {
        return [
          myLayout({
            slots: { 'after-footer': [h.div('yes'), h.span('very much')] }
          }),
        ]
      }
    }
    TestSlotNamedMultipleElement.register();

    const comp = mount(TestSlotNamedMultipleElement);
    const layout = await comp.query<MyLayout>('app-my-layout');

    const footer = layout.shadowRoot?.children[3] as HTMLSlotElement;;
    const footerEls = (footer.assignedElements() as HTMLElement[]);

    expect(footerEls[0].innerHTML).to.contain('yes');
    expect(footerEls[1].innerHTML).to.contain('very much');
  }))

})
