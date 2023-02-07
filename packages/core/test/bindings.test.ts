import { test, expect } from '@jest/globals';
import Component from "component";
import h from 'html';
import { Prop, Subject } from 'rx';
import Binding from 'rx/binding';
import { testDoc } from './util';

class MyBoundInput extends Component {
  props = { value: new Prop('') };

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

test('one binding', async () => {
  class BindingTest extends Component {
    // #state = new Subject('nothing');
    state = new Binding('initial');

    render = () => [
      MyBoundInput.new({ props: { value: this.state }}),
    ]
  }
  BindingTest.register();

  const [_, comp] = testDoc(new BindingTest());
  const myInput = await comp.query<MyBoundInput>('mvui-my-bound-input');
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


test('two bindings', async () => {
  class BindingTestTwo extends Component {
    // #state = new Subject('nothing');
    state = new Binding('initial');

    render = () => [
      MyBoundInput.new({ props: { value: this.state }}),
      MyBoundInput.new({ props: { value: this.state }}),
    ]
  }
  BindingTestTwo.register();

  const [_, comp] = testDoc(new BindingTestTwo());
  const myInputs = await comp.queryAll<MyBoundInput>('mvui-my-bound-input');
  let inputs: HTMLInputElement[] = [];
  for (let input of Array.from(myInputs)) {
    inputs.push(await input.query<HTMLInputElement>('input'));
  }

  const check = (text: string) => {
    expect(inputs[0].value).toBe(text);
    expect(inputs[1].value).toBe(text);
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

