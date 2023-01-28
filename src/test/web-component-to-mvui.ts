import TemplateElement from "template-element";

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

export default SomeWebComponentLibraryWrapper;
