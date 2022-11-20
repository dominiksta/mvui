import { Subject } from "../observables";
import Component from "../component";
import Html from "../html";

export class DumbComponent extends Component {

  private state = { value: new Subject('') };
  public value = this.publicProp('value', this.state.value);

  render = () => [
    Html.FieldSet([
      Html.Legend('I am a dumb Component'),
      Html.P(this.state.value.map(v => `I render this value: ${v}`))
    ])
  ]
}
customElements.define('mvui-test-dumb', DumbComponent);

export class SmartComponent extends Component {

  private state = new Subject('reactive value');

  render = () => [
    Html.FieldSet([
      Html.Legend('I am a smart component'),
      Html.Button({ events: {
        onclick: () => this.state.next('second reactive value')
      }}, 'Change reactive value'),
      DumbComponent.new({ instance: { value: 'test' }}),
      DumbComponent.new({ instance: { value: this.state }}),
      DumbComponent.new(
        { attrs: { value: this.state.map(v => v + ' from attribute') }}
      ),
    ])
  ]
}
customElements.define('mvui-test-smart', SmartComponent);
