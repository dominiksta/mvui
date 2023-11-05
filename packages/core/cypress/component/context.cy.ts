import { Component, rx, h } from "$thispkg";
import { attempt, mount } from "../support/helpers";

const selectCtx = new rx.Context(() => new rx.State('val1'));

@Component.register
class MySelect extends Component {
  render() {
    const ctx = this.provideContext(selectCtx);

    return [
      h.div(
        { attrs: { id: 'curr-value'}},
        ctx.derive(v => `Current Value: ${v}`)
      ),
      h.div(h.slot()),
    ]
  }
}

@Component.register
class MySelectItem extends Component {
  props = {
    value: new rx.Prop<string>(),
  }

  render() {
    const ctx = this.getContext(selectCtx);

    return [
      h.button({ events: { click: _ => ctx.next(this.props.value.value) }})
    ]
  }
}

describe('context', () => {

  it('kind works', attempt(async () => {

    @Component.register
    class ContextTest extends Component {
      render() {
        return [
          MySelect.t([
            MySelectItem.t({ props: { value: 'val1' } }),
            MySelectItem.t({ props: { value: 'val2' } }),
            MySelectItem.t({ props: { value: 'val3' } }),
          ])
        ];
      }
    }

    const comp = mount(ContextTest);
    const currVal = await (await comp.query<MySelect>('app-my-select')).query(
      '#curr-value'
    );

    const selectItems = await comp.queryAll<MySelectItem>('app-my-select-item');
    let selectButtons: HTMLButtonElement[] = [];
    for (let si of Array.from(selectItems)) {
      selectButtons.push(await si.query('button'));
    }

    expect(currVal.innerText).to.be.eq('Current Value: val1');
    selectButtons[1].click();
    expect(currVal.innerText).to.be.eq('Current Value: val2');
    selectButtons[2].click();
    expect(currVal.innerText).to.be.eq('Current Value: val3');
    selectButtons[0].click();
    expect(currVal.innerText).to.be.eq('Current Value: val1');

  }));

})
