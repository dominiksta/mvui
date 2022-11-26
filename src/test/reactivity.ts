import { Observable, Subject } from "../observables";
import Component from "../component";
import Html from "../html";

export class ReactiveList extends Component {
  list = new Subject(['item 1', 'item 2']);
  counter = new Subject(0);

  render = () => [
    Html.FieldSet([
      Html.Legend('Child Component: Reactive List'),
      Html.Button({ events: { click: () => {
        this.counter.next(this.counter.value + 1)
      }}}, 'Increment Counter'),
      Html.Button({ events: { click: () => {
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
ReactiveList.register();


export class CounterComponent extends Component {
  private count = new Subject(0);
  private multiplier = new Subject(1);
  private sum = Observable.fromLatest(this.count, this.multiplier);

  render = () => [
    Html.FieldSet([
      Html.Legend('Child Component: Reactivity'),
      Html.P('This is a "reactive" Counter'),
      Html.Button({ events: {
        click: () => this.count.next(this.count.value + 1)
      }}, 'Increase Count'),
      Html.Button({ events: {
        click: () => this.multiplier.next(this.multiplier.value + 1)
      }}, 'Increase Multiplier'),
      Html.Span(this.sum.map(([c, m]) => `${c} * ${m} = ${c * m}`)),
    ])
  ];
}
CounterComponent.register();
