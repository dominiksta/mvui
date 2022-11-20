import { Subject } from "./observables";
import Component from "./component";
import Html from "./html";

export class CounterComponent extends Component {
  count = new Subject(0);

  render = () => [
    Html.FieldSet([
      Html.Legend('Child Component: Reactivity'),
      Html.P('This is a "reactive" Counter'),
      Html.Button({ events: {
        onclick: () => this.count.next(this.count.value + 1)
      }}, 'Increase Count'),
      Html.Span(this.count.map(v => v * 2)),
      Html.Input({ attrs: { type: "number", value: this.count, disabled: true }})
    ])
  ];
}
customElements.define('counter-component', CounterComponent);

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
      CounterComponent.new(),
      Html.P('Here is some text in a paragraph'),
      Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" } }),
    ])
  ];
}
customElements.define('test-component', TestComponent);

