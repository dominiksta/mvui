import { Component, h, TemplateElement } from '$thispkg';
import { attempt, mount, waitFrame } from '../support/helpers';

class SomeWebComponent extends HTMLElement {

  private _state = { prop1: 1, attr1: 1 }

  private render() {
    this.innerHTML = "";
    const content = document.createElement("div");
    content.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('customEvt1', { detail: 1337 }));
    });
    content.innerText = `I am a (non-mvui) web component. prop1: ${this.prop1}, ` +
      `attr1: ${this.getAttribute('attr1')}`;
    this.appendChild(content);
  }

  set prop1(value: number) {
    this._state.prop1 = value;
    this.render();
  }
  get prop1() { return this._state.prop1 };

  connectedCallback() { this.render(); }
  disconnectedCallback() { this.innerHTML = ""; }

  attributeChangedCallback(
    attribute: string, _previousValue: any, currentValue: any
  ) {
    if (attribute === "attr1") {
      this._state.attr1 = currentValue;
      this.render();
    }
  }
}
customElements.define('some-web-component', SomeWebComponent);

const SomeWebComponentLibraryWrapper = {
  SomeWebComponent: TemplateElement.fromCustom<
    SomeWebComponent, {
      events: { 'customEvt1': number },
      attributes: { 'attr1': number }
    }
  >(
    () => new SomeWebComponent()
  )
}

describe('web component to mvui', () => {
  it('kinda works', attempt(async () => {

    let state = 'initial';

    class ComponentUsingWrapper extends Component {
      render = () => [
        h.fieldset([
          h.legend('Web Component Wrappers'),
          SomeWebComponentLibraryWrapper.SomeWebComponent({
            attrs: { id: 'wrapped-comp', attr1: 4 }, fields: { prop1: 5 },
            events: {
              customEvt1: e => { state = 'changed' }
            },
          }),
        ]),
      ]
    }
    ComponentUsingWrapper.register();

    const comp = mount(ComponentUsingWrapper);
    const wrapped = await comp.query<SomeWebComponent>('#wrapped-comp');

    expect(wrapped.getAttribute('attr1')).to.be.eq('4');
    expect(wrapped.prop1).to.be.eq(5);
    expect(state).to.be.eq('initial');
    (wrapped.children[0] as any).click();
    await waitFrame();
    expect(state).to.be.eq('changed');
  }));

})

