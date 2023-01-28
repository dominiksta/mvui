import { Observable, Subject } from "rx";
import Component from "component";
import Html from "html";
import { fromLatest } from "rx/operators";

export class ReactiveList extends Component {
  private list = new Subject(['item 1', 'item 2']);
  private counter = new Subject(0);
  private editableList = new Subject([
    { name: 'name1', value: 'val1' },
    { name: 'name2', value: 'val2' },
  ])

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

      Html.H5('Editable list'),

      Html.Button({ events: { click: () => {
        this.editableList.next([
          ...this.editableList.value, {
            name: `name${this.editableList.value.length + 1}`,
            value: `val${this.editableList.value.length + 1}`,
          }
        ]);
      }}}, 'Add new element'),
      Html.Ul(
        this.editableList.map(s => s.length).map(() =>
          this.editableList.value.map((v, i) =>
            Html.Li([
              Html.Span(v.name + ' :'),
              Html.Input({
                attrs: { value: v.value },
                events: {
                  change: e => {
                    this.editableList.value[i].value = e.target.value;
                    this.editableList.next(this.editableList.value);
                  }
                }
              }),
              Html.Button({
                style: { color: 'red' },
                events: { click: () => {
                  this.editableList.value.splice(i, 1);
                  console.log(this.editableList.value);
                  this.editableList.next(this.editableList.value);
                }}
              }, 'x')
            ])
          )
        )
      ),
    ])
  ];
}
ReactiveList.register();


export class CounterComponent extends Component {
  private count = new Subject(0);
  private multiplier = new Subject(1);
  private sum = fromLatest(this.count, this.multiplier);

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
