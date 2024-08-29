import { Component, h, rx } from "$thispkg";
import { getContainerEl } from "@cypress/mount-utils";
import { attempt } from "../support/helpers";

const lifecycle = new rx.State<string>('initial');

@Component.register
class LifecycleTestComponent extends Component {

  render() {
    const counter = new rx.State(0);

    this.onAdded(() => lifecycle.next('added'));
    this.onRendered(() => lifecycle.next('rendered'));
    this.onRemoved(() => lifecycle.next('removed'));

    return [
      h.button({
        fields: { id: 'inc' },
        events: { click: _ => counter.next(c => c + 1)},
      }, 'inc'),
      h.div({ fields: { id: 'display' }}, counter),
    ];
  }
}

describe('lifecycle', () => {
  it('general lifecycle', attempt(async () => {

    lifecycle.next('initial');

    const doc = getContainerEl();
    const comp = new LifecycleTestComponent();
    console.log(comp);

    const lifecycles: string[] = [];
    lifecycle.pipe(rx.skip(1)).subscribe(l => {
      lifecycles.push(l);
      console.log(lifecycles);
    });

    doc.appendChild(comp);

    let btn           = await comp.query('#inc');
    let display       = await comp.query('#display');

    expect(lifecycles).to.deep.eq(['added', 'rendered']);
    expect(display.innerText).to.be.eq('0');

    btn.click(); expect(display.innerText).to.be.eq('1');
    btn.click(); expect(display.innerText).to.be.eq('2');

    const lifecyclesPrev = {
      'added': (comp as any)._lifecycleHooks.added.length,
      'removed': (comp as any)._lifecycleHooks.removed.length,
      'render': (comp as any)._lifecycleHooks.render.length,
    };

    doc.removeChild(comp);

    expect(lifecycles).to.deep.eq(['added', 'rendered', 'removed']);

    expect(display.innerText).to.be.eq('2');

    console.log(lifecycles);
    doc.appendChild(comp);

    console.log((comp as any)._lifecycleHooks);

    console.log(lifecycles);
    expect(lifecycles).to.deep.eq(['added', 'rendered', 'removed', 'added']);

    btn           = await comp.query('#inc');
    display       = await comp.query('#display');

    expect(display.innerText).to.be.eq('2');

    btn.click(); expect(display.innerText).to.be.eq('3');

    for (const t of ['added', 'render', 'removed']) {
      expect((comp as any)._lifecycleHooks[t].length)
        .to.eq((lifecyclesPrev as any)[t], 'lifecycle hooks amount not changed');
    }

  }));

})

