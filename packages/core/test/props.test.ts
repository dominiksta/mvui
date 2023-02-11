import { test, expect } from '@jest/globals';
import { State, Prop } from "rx";
import Component from "component";
import h from "html";
import { testDoc } from './util';

class DumbComponent extends Component {

  props = { value: new Prop('', { reflect: true }) };

  render = () => [
    h.fieldset([
      h.legend('I am a dumb Component'),
      h.p(this.props.value.map(v => `I render this value: ${v}`))
    ])
  ]
}
DumbComponent.register();

class SmartComponent extends Component {

  private state = new State('reactive value');

  render = () => [
    h.fieldset([
      h.legend('I am a smart component'),
      h.button({ events: {
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

test('basic props', async () => {
  const [_, comp] = testDoc(new SmartComponent());
  const children = await comp.queryAll<DumbComponent>('mvui-dumb-component');
  expect(children.length).toBe(3);

  expect(children[0].getAttribute("value")).toBe('test');
  expect(children[1].getAttribute("value")).toBe('reactive value');
  expect(children[2].getAttribute("value")).toBe('reactive value from attribute');

  (await comp.query('button')).click();

  expect(children[0].getAttribute("value")).toBe('test');
  expect(children[1].getAttribute("value")).toBe('second reactive value');
  expect(children[2].getAttribute("value")).toBe('second reactive value from attribute');
})
