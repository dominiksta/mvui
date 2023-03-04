import { test, expect } from '@jest/globals';
import Component from "component";
import define from "define";
import h from "html";
import { rx } from "index";
import { testDoc } from './util';

const selectCtx = new rx.Context(() => new rx.State('val1'));

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
const [ mySelect ] = define(MySelect);

class MySelectItem extends Component {
  props = {
    value: new rx.Prop(''),
  }

  render() {
    const ctx = this.getContext(selectCtx);

    return [
      h.button({ events: { click: _ => ctx.next(this.props.value.value) }})
    ]
  }
}
const [ mySelectItem ] = define(MySelectItem);

test('context', async () => {

  class ContextTest extends Component {
    render() {
      return [ 
        mySelect([
          mySelectItem({ props: { value: 'val1' }}),
          mySelectItem({ props: { value: 'val2' }}),
          mySelectItem({ props: { value: 'val3' }}),
        ])
      ];
    }
  }
  define(ContextTest);

  const [_, comp] = testDoc(new ContextTest());
  const currVal = await (await comp.query<MySelect>('app-my-select')).query('#curr-value');

  const selectItems = await comp.queryAll<MySelectItem>('app-my-select-item');
  let selectButtons: HTMLButtonElement[] = [];
  for (let si of Array.from(selectItems)) {
    selectButtons.push(await si.query('button'));
  }

  expect(currVal.innerText).toBe('Current Value: val1');
  selectButtons[1].click();
  expect(currVal.innerText).toBe('Current Value: val2');
  selectButtons[2].click();
  expect(currVal.innerText).toBe('Current Value: val3');
  selectButtons[0].click();
  expect(currVal.innerText).toBe('Current Value: val1');

});
