import Component from "./component";
import Html from "./html";

export class TestChildComponent extends Component {
  render = () => [
    Html.P('I am a Child Component')
  ];
}
customElements.define('test-child-component', TestChildComponent);

export default class TestComponent extends Component {
  render = () => [
    Html.Div([
      Html.H1('Heading'),
      Html.H3({ style: { background: 'red' } }, 'Heading Level 3'),
      TestChildComponent.new(),
      Html.P('Here is some text in a paragraph'),
      Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" } }),
    ])
  ];
}
customElements.define('test-component', TestComponent);

