import { test, expect } from '@jest/globals';
import Component from 'component';
import h from 'html';
import TemplateElement from "template-element";
import { testDoc, waitFrame } from './util';

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
    SomeWebComponent, { 'customEvt1': number }, { 'attr1': number }
  >(
    () => new SomeWebComponent()
  )
}


test('template references', async () => {

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

  const comp = testDoc(new ComponentUsingWrapper())[1];
  const wrapped = await comp.query<SomeWebComponent>('#wrapped-comp');

  expect(wrapped.getAttribute('attr1')).toBe('4');
  expect(wrapped.prop1).toBe(5);
  expect(state).toBe('initial');
  (wrapped.children[0] as any).click();
  waitFrame();
  expect(state).toBe('changed');
  

});
