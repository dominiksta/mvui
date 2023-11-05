import { Component, rx, h } from "$thispkg";
import { attempt, mount } from "../support/helpers";

@Component.register
class DumbComponent extends Component {

  props = {
    required: new rx.Prop<string>({ reflect: true }),
    withDefault: new rx.PropWithDefault('default', { reflect: true }),
    optional: new rx.Prop<string | undefined>({ reflect: true }),
  };

  render = () => [
    h.fieldset([
      h.legend('I am a dumb Component'),
      h.p(this.props.withDefault.map(v => `I render this value: ${v}`))
    ])
  ]
}

@Component.register
class SmartComponent extends Component {

  private state = new rx.State('reactive value');

  render = () => [
    h.fieldset([
      h.legend('I am a smart component'),
      h.button({ events: {
        click: () => this.state.next('second reactive value')
      }}, 'Change reactive value'),
      DumbComponent.t({ props: {
        required: 'test',
      }}),
      DumbComponent.t({ props: {
        required: this.state,
        withDefault: this.state,
        optional: this.state,
      }}),
      DumbComponent.t(
        { attrs: {
          required: this.state.map(v => v + ' from attribute'),
          withDefault: this.state.map(v => v + ' from attribute'),
          optional: this.state.map(v => v + ' from attribute'),
        }}
      ),
    ])
  ]
}

describe('props', (() => {
  it('basic props', attempt(async () => {
    const comp = mount(SmartComponent);
    const children = await comp.queryAll<DumbComponent>('app-dumb-component');
    expect(children.length).to.be.eq(3);

    const attr = (idx: number, attr: string) => children[idx].getAttribute(attr);

    expect(attr(0, 'required')).to.eq('test');
    expect(attr(1, 'required')).to.eq('reactive value');
    expect(attr(2, 'required')).to.eq('reactive value from attribute');

    expect(attr(0, 'with-default')).to.eq('default');
    expect(attr(1, 'with-default')).to.eq('reactive value');
    expect(attr(2, 'with-default')).to.eq('reactive value from attribute');

    expect(attr(0, 'optional')).to.eq('undefined');
    expect(attr(1, 'optional')).to.eq('reactive value');
    expect(attr(2, 'optional')).to.eq('reactive value from attribute');

    (await comp.query('button')).click();

    expect(attr(0, 'required')).to.eq('test');
    expect(attr(1, 'required')).to.eq('second reactive value');
    expect(attr(2, 'required')).to.eq('second reactive value from attribute');

    expect(attr(0, 'with-default')).to.eq('default');
    expect(attr(1, 'with-default')).to.eq('second reactive value');
    expect(attr(2, 'with-default')).to.eq('second reactive value from attribute');

    expect(attr(0, 'optional')).to.eq('undefined');
    expect(attr(1, 'optional')).to.eq('second reactive value');
    expect(attr(2, 'optional')).to.eq('second reactive value from attribute');
  }))
}))

