import { Subject } from "../observables";
import Component from "../component";
import Html from "../html";
import Prop from "../prop";

export class DumbComponent extends Component {

  props = { value: new Prop('', { reflect: true }) };

  render = () => [
    Html.FieldSet([
      Html.Legend('I am a dumb Component'),
      Html.P(this.props.value.map(v => `I render this value: ${v}`))
    ])
  ]
}
DumbComponent.register();

export class SmartComponent extends Component {

  private state = new Subject('reactive value');

  render = () => [
    Html.FieldSet([
      Html.Legend('I am a smart component'),
      Html.Button({ events: {
        click: () => this.state.next('second reactive value')
      }}, 'Change reactive value'),
      DumbComponent.new({ props: { value: 'test' }}),
      DumbComponent.new({ props: { value: this.state }}),
      DumbComponent.new(
        { attrs: { value: this.state.map(v => v + ' from attribute') }}
      ),
    ])
  ]
}
SmartComponent.register();
