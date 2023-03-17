import { test, expect } from '@jest/globals';
import Component from "component";
import h from 'html';
import * as rx from 'rx';
import { sleep } from 'util/time';
import { testDoc, waitFrame } from './util';

class MyBoundInput extends Component {
  props = { value: new rx.Prop('') };

  render = () => [
    h.input({ fields: { ...this.props }, events: {
      change: e => {
        // console.log('event');
        this.props.value.next(e.target.value)
      }
    }})
  ]
}
MyBoundInput.register();

test('prop binding', async () => {
  class BindingTest extends Component {
    state = new rx.State('initial');

    render = () => [
      MyBoundInput.new({ props: { value: rx.bind(this.state) }}),
    ]
  }
  BindingTest.register();

  const [_, comp] = testDoc(new BindingTest());
  const myInput = await comp.query<MyBoundInput>('app-my-bound-input');
  const input = await myInput.query<HTMLInputElement>('input');

  expect(input.value).toBe('initial');

  comp.state.next('from outer');
  expect(input.value).toBe('from outer');

  input.value = 'from inner';
  input.dispatchEvent(new Event('change'));
  expect(comp.state.value).toBe('from inner');

  input.value = 'from inner 2';
  input.dispatchEvent(new Event('change'));
  expect(comp.state.value).toBe('from inner 2');

  comp.state.next('from outer 2');
  expect(input.value).toBe('from outer 2');

  comp.state.next('from outer 3');
  expect(input.value).toBe('from outer 3');

  comp.state.next('from outer 4');
  expect(input.value).toBe('from outer 4');

  input.value = 'from inner 4';
  input.dispatchEvent(new Event('change'));
  expect(comp.state.value).toBe('from inner 4');

  comp.state.next('from outer 5');
  expect(input.value).toBe('from outer 5');

});

test('field binding', async () => {
  class BindingTestField extends Component {
    state = new rx.State('initial');

    render = () => [
      h.input({ fields: { value: rx.bind(this.state) }}),
    ]
  }
  BindingTestField.register();

  const [_, comp] = testDoc(new BindingTestField());
  const input = await comp.query<HTMLInputElement>('input');

  expect(input.value).toBe('initial');

  comp.state.next('from outer');
  expect(input.value).toBe('from outer');

  input.value = 'from inner';
  input.dispatchEvent(new Event('change'));
  expect(comp.state.value).toBe('from inner');

  comp.state.next('from outer 2');
  expect(input.value).toBe('from outer 2');

  comp.state.next('from outer 4');
  expect(input.value).toBe('from outer 4');

  input.value = 'from inner 4';
  input.dispatchEvent(new Event('change'));
  expect(comp.state.value).toBe('from inner 4');
});


test('type coercion/serialization', async () => {
  class BindingsTestSerialization extends Component {
    noCoerce = new rx.State('0');
    coerce = new rx.State(0);

    render() {
      return [
        h.input({
          fields: {
            value: rx.bind(this.noCoerce)
          }
        }),
        h.span(this.noCoerce),
        h.input({
          fields: {
            type: 'number', value: rx.bind(this.coerce, { serialize: true })
          }
        }),
      ]
    }
  }
  BindingsTestSerialization.register();

  const [_, comp] = testDoc(new BindingsTestSerialization());
  let inputs: HTMLInputElement[] = [];
  for (let input of Array.from(await comp.queryAll<HTMLInputElement>('input'))) {
    inputs.push(input);
  }

  expect(comp.noCoerce.value).toBe('0');
  expect(inputs[0].value).toBe('0');
  expect(comp.coerce.value).toBe(0);
  expect(inputs[1].value).toBe('0');

  comp.coerce.next(1);

  expect(comp.coerce.value).toBe(1);
  expect(inputs[1].value).toBe('1');

  comp.noCoerce.next('1');
  expect(inputs[0].value).toBe('1');

  inputs[0].value = '2';
  inputs[0].dispatchEvent(new Event('change'));

  expect(comp.noCoerce.value).toBe('2');
  expect(inputs[0].value).toBe('2');

  inputs[1].value = '2';
  inputs[1].dispatchEvent(new Event('change'));

  expect(comp.coerce.value).toBe(2);
  expect(inputs[1].value).toBe('2');

  inputs[1].value = 'notavalidnumber';
  inputs[1].dispatchEvent(new Event('change'));

  expect(comp.coerce.value).toBe(2);
  expect(inputs[1].value).toBe('');
});

test('two bindings', async () => {
  class BindingTestTwo extends Component {
    // #state = new State('nothing');
    state = new rx.State('initial');

    render = () => [
      MyBoundInput.new({ props: { value: rx.bind(this.state) } }),
      MyBoundInput.new({ props: { value: rx.bind(this.state) } }),
      h.input({ fields: { value: rx.bind(this.state) } }),
    ]
  }
  BindingTestTwo.register();

  const [_, comp] = testDoc(new BindingTestTwo());
  const myInputs = await comp.queryAll<MyBoundInput>('app-my-bound-input');
  let inputs: HTMLInputElement[] = [];
  for (let input of Array.from(myInputs)) {
    inputs.push(await input.query<HTMLInputElement>('input'));
  }
  inputs.push(await comp.query<HTMLInputElement>('input'));

  const check = (text: string) => {
    expect(inputs[0].value).toBe(text);
    expect(inputs[1].value).toBe(text);
    expect(inputs[2].value).toBe(text);
  }

  check('initial');

  comp.state.next('from outer');
  check('from outer');

  inputs[0].value = 'from inner';
  inputs[0].dispatchEvent(new Event('change'));
  check('from inner');

  inputs[0].value = 'from inner 2';
  inputs[0].dispatchEvent(new Event('change'));
  check('from inner 2');

  inputs[1].value = 'from inner 3';
  inputs[1].dispatchEvent(new Event('change'));
  check('from inner 3');

  inputs[1].value = 'from inner 3.1';
  inputs[1].dispatchEvent(new Event('change'));
  check('from inner 3.1');

  comp.state.next('from outer 2');
  check('from outer 2');

  comp.state.next('from outer 3');
  check('from outer 3');

  comp.state.next('from outer 4');
  check('from outer 4');

  inputs[0].value = 'from inner 4';
  inputs[0].dispatchEvent(new Event('change'));
  check('from inner 4');

  comp.state.next('from outer 5');
  check('from outer 5');

});
