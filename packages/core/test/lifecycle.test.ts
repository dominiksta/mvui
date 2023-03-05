import { test, expect } from '@jest/globals';
import Component from "component";
import h from "html";
import { define, rx } from 'index';
import { arrayCompare } from 'util/datastructure';

const lifecycle = new rx.State<string>('initial');

class LifecycleTestComponent extends Component {

  render() {
    this.onAdded(() => lifecycle.next('added'));
    this.onRender(() => lifecycle.next('render'));
    this.onRemoved(() => lifecycle.next('removed'));

    const counter = new rx.State(0);

    return [
      h.button({ events: { click: _ => counter.next(c => c + 1)} }),
      h.div(counter),
    ];
  }
}
define(LifecycleTestComponent);

test('general lifecycle', async () => {

  lifecycle.next('initial');

  const doc = new Document();
  const comp = new LifecycleTestComponent();

  const lifecycles: string[] = [];
  lifecycle.pipe(rx.skip(1)).subscribe(l => lifecycles.push(l));

  doc.appendChild(comp);

  let btn = await comp.query('button');
  let counterDiv = await comp.query('div');

  expect(arrayCompare(lifecycles, [
    'added', 'render'
  ])).toBeTruthy();
  expect(counterDiv.innerText).toBe('0');

  btn.click(); expect(counterDiv.innerText).toBe('1');
  btn.click(); expect(counterDiv.innerText).toBe('2');

  doc.removeChild(comp);

  expect(arrayCompare(lifecycles, [
    'added', 'render', 'removed'
  ])).toBeTruthy();

  expect(counterDiv.innerText).toBe('2');

  doc.appendChild(comp);

  expect(arrayCompare(lifecycles, [
    'added', 'render', 'removed', 'added', 'render'
  ])).toBeTruthy();

  btn = await comp.query('button');
  counterDiv = await comp.query('div');

  expect(counterDiv.innerText).toBe('2');

  btn.click(); expect(counterDiv.innerText).toBe('3');
});
