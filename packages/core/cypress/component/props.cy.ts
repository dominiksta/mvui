import { Component, rx, h } from "$thispkg";
import { attempt, mount } from "../support/helpers";

@Component.register
class DumbComponent extends Component {

  props = { value: new rx.Prop('', { reflect: true }) };

  render = () => [
    h.fieldset([
      h.legend('I am a dumb Component'),
      h.p(this.props.value.map(v => `I render this value: ${v}`))
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
      DumbComponent.t({ props: { value: 'test' }}),
      DumbComponent.t({ props: { value: this.state }}),
      DumbComponent.t(
        { attrs: { value: this.state.map(v => v + ' from attribute') }}
      ),
    ])
  ]
}

describe('props', (() => {
  it('basic props', attempt(async () => {
    const comp = mount(SmartComponent);
    const children = await comp.queryAll<DumbComponent>('app-dumb-component');
    expect(children.length).to.be.eq(3);

    expect(children[0].getAttribute("value")).to.be.eq('test');
    expect(children[1].getAttribute("value")).to.be.eq('reactive value');
    expect(children[2].getAttribute("value"))
      .to.be.eq('reactive value from attribute');

    (await comp.query('button')).click();

    expect(children[0].getAttribute("value")).to.be.eq('test');
    expect(children[1].getAttribute("value")).to.be.eq('second reactive value');
    expect(children[2].getAttribute("value"))
      .to.be.eq('second reactive value from attribute');
  }))
}))

