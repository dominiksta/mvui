import { Component, h, rx } from "$thispkg";
import { attempt, mount } from "../support/helpers";

@Component.register
class MyBoundInput extends Component {
  props = { value: rx.prop<string>() };

  render = () => [
    h.input({
      fields: { ...this.props }, events: {
        change: e => {
          // console.log('event');
          this.props.value.next(e.target.value)
        }
      }
    })
  ]
}

describe('bindings', () => {
  it('prop binding', attempt(async () => {
    @Component.register
    class BindingTest extends Component {
      state = new rx.State('initial');

      render = () => [
        MyBoundInput.t({ props: { value: rx.bind(this.state) } }),
      ]
    }

    const comp = mount(BindingTest);
    const myInput = await comp.query<MyBoundInput>('app-my-bound-input');
    const input = await myInput.query<HTMLInputElement>('input');

    expect(input.value).to.be.eq('initial');

    comp.state.next('from outer');
    expect(input.value).to.be.eq('from outer');

    input.value = 'from inner';
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner');

    input.value = 'from inner 2';
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner 2');

    comp.state.next('from outer 2');
    expect(input.value).to.be.eq('from outer 2');

    comp.state.next('from outer 3');
    expect(input.value).to.be.eq('from outer 3');

    comp.state.next('from outer 4');
    expect(input.value).to.be.eq('from outer 4');

    input.value = 'from inner 4';
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner 4');

    comp.state.next('from outer 5');
    expect(input.value).to.be.eq('from outer 5');

  }));

  it('field binding', attempt(async () => {
    @Component.register
    class BindingTestField extends Component {
      state = new rx.State('initial');

      render = () => [
        h.input({ fields: { value: rx.bind(this.state) } }),
      ]
    }

    const comp = mount(BindingTestField);
    const input = await comp.query<HTMLInputElement>('input');

    expect(input.value).to.be.eq('initial');

    comp.state.next('from outer');
    expect(input.value).to.be.eq('from outer');

    input.value = 'from inner';
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner');

    comp.state.next('from outer 2');
    expect(input.value).to.be.eq('from outer 2');

    comp.state.next('from outer 4');
    expect(input.value).to.be.eq('from outer 4');

    input.value = 'from inner 4';
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner 4');
  }));

  it('attribute binding', attempt(async () => {
    @Component.register
    class BindingTestAttribute extends Component {
      state = new rx.State('initial');

      render = () => [
        h.input({ attrs: { value: rx.bind(this.state) } }),
      ]
    }

    const comp = mount(BindingTestAttribute);
    const input = await comp.query<HTMLInputElement>('input');

    expect(input.value).to.be.eq('initial');

    comp.state.next('from outer');
    expect(input.value).to.be.eq('from outer');

    input.setAttribute('value', 'from inner');
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner');

    comp.state.next('from outer 2');
    expect(input.getAttribute('value')).to.be.eq('from outer 2');

    comp.state.next('from outer 4');
    expect(input.getAttribute('value')).to.be.eq('from outer 4');

    input.setAttribute('value', 'from inner 4');
    input.dispatchEvent(new Event('change'));
    expect(comp.state.value).to.be.eq('from inner 4');
  }));


  it('type coercion/serialization', attempt(async () => {
    @Component.register
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

    const comp = mount(BindingsTestSerialization);
    let inputs: HTMLInputElement[] = [];
    for (let input of Array.from(await comp.queryAll<HTMLInputElement>('input'))) {
      inputs.push(input);
    }

    expect(comp.noCoerce.value).to.be.eq('0');
    expect(inputs[0].value).to.be.eq('0');
    expect(comp.coerce.value).to.be.eq(0);
    expect(inputs[1].value).to.be.eq('0');

    comp.coerce.next(1);

    expect(comp.coerce.value).to.be.eq(1);
    expect(inputs[1].value).to.be.eq('1');

    comp.noCoerce.next('1');
    expect(inputs[0].value).to.be.eq('1');

    inputs[0].value = '2';
    inputs[0].dispatchEvent(new Event('change'));

    expect(comp.noCoerce.value).to.be.eq('2');
    expect(inputs[0].value).to.be.eq('2');

    inputs[1].value = '2';
    inputs[1].dispatchEvent(new Event('change'));

    expect(comp.coerce.value).to.be.eq(2);
    expect(inputs[1].value).to.be.eq('2');

    inputs[1].value = 'notavalidnumber';
    inputs[1].dispatchEvent(new Event('change'));

    expect(comp.coerce.value).to.be.NaN;
    expect(inputs[1].value).to.be.eq('');
  }));

  it('two bindings', async () => {
    @Component.register
    class BindingTestTwo extends Component {
      // #state = new State('nothing');
      state = new rx.State('initial');

      render = () => [
        MyBoundInput.t({ props: { value: rx.bind(this.state) } }),
        MyBoundInput.t({ props: { value: rx.bind(this.state) } }),
        h.input({ fields: { value: rx.bind(this.state) } }),
      ]
    }

    const comp = mount(BindingTestTwo);
    const myInputs = await comp.queryAll<MyBoundInput>('app-my-bound-input');
    let inputs: HTMLInputElement[] = [];
    for (let input of Array.from(myInputs)) {
      inputs.push(await input.query<HTMLInputElement>('input'));
    }
    inputs.push(await comp.query<HTMLInputElement>('input'));

    const check = (text: string) => {
      expect(inputs[0].value).to.be.eq(text);
      expect(inputs[1].value).to.be.eq(text);
      expect(inputs[2].value).to.be.eq(text);
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

})


