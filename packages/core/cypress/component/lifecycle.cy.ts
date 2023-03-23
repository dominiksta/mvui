import { Component, h, rx, define } from "$thispkg";
import { attempt } from "../support/helpers";

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

describe('lifecycle', () => {
  it('general lifecycle', attempt(async () => {

    lifecycle.next('initial');

    const doc = new Document();
    const comp = new LifecycleTestComponent();

    const lifecycles: string[] = [];
    lifecycle.pipe(rx.skip(1)).subscribe(l => lifecycles.push(l));

    doc.appendChild(comp);

    let btn = await comp.query('button');
    let counterDiv = await comp.query('div');

    expect(lifecycles).to.deep.eq(['added', 'render']);
    expect(counterDiv.innerText).to.be.eq('0');

    btn.click(); expect(counterDiv.innerText).to.be.eq('1');
    btn.click(); expect(counterDiv.innerText).to.be.eq('2');

    doc.removeChild(comp);

    expect(lifecycles).to.deep.eq(['added', 'render', 'removed']);

    expect(counterDiv.innerText).to.be.eq('2');

    doc.appendChild(comp);

    expect(lifecycles).to.deep.eq([
      'added', 'render', 'removed', 'added', 'render'
    ]);

    btn = await comp.query('button');
    counterDiv = await comp.query('div');

    expect(counterDiv.innerText).to.be.eq('2');

    btn.click(); expect(counterDiv.innerText).to.be.eq('3');
  }));

})

