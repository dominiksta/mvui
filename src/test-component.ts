import { Subject } from "./observables";
import Component from "./component";
import Html from "./html";

export class ReactiveList extends Component {
  list = new Subject(['item 1', 'item 2']);
  counter = new Subject(0);

  render = () => [
    Html.FieldSet([
      Html.Legend('Child Component: Reactive List'),
      Html.Button({ events: { onclick: () => {
        this.counter.next(this.counter.value + 1)
      }}}, 'Increment Counter'),
      Html.Button({ events: { onclick: () => {
        this.list.next([
          ...this.list.value, 'item ' + (this.list.value.length + 1)
        ])
      }}}, 'Add a new list element'),
      Html.H5('List with static elements'),
      Html.Ul(this.list.map(v => v.map(v => Html.Li(v)))),
      Html.H5('List with reactive child elements'),
      Html.Ul(this.list.map(v => v.map(() => Html.Li(this.counter)))),
    ])
  ];
}
customElements.define('reactive-list', ReactiveList);


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
      Html.Input({ instance: {
        type: "number",  value: this.count.map(v => v.toString())
      }})
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
      ReactiveList.new(),
      Html.P('Here is some text in a paragraph'),
      Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" } }),
    ])
  ];
}
customElements.define('test-component', TestComponent);

