import { Component, h, rx } from "$thispkg";
import { attempt } from "../support/helpers";

const lifecycle = new rx.State<string>('initial');

@Component.register
class LifecycleTestComponent extends Component {

  stickyCounter = new rx.State(100);

  render() {
    const counter = new rx.State(0);

    lifecycle.next('added');
    this.onRendered(() => lifecycle.next('rendered'));
    this.onRemoved(() => lifecycle.next('removed'));

    return [
      h.button({
        fields: { id: 'inc' },
        events: { click: _ => counter.next(c => c + 1)},
      }),
      h.button({
        fields: { id: 'incSticky' },
        events: { click: _ => this.stickyCounter.next(c => c + 1)},
      }),
      h.div({ fields: { id: 'display' }}, counter),
      h.div({ fields: { id: 'displaySticky' }}, this.stickyCounter),
    ];
  }
}

describe('lifecycle', () => {
  it('general lifecycle', attempt(async () => {

    lifecycle.next('initial');

    const doc = new Document();
    const comp = new LifecycleTestComponent();

    const lifecycles: string[] = [];
    lifecycle.pipe(rx.skip(1)).subscribe(l => lifecycles.push(l));

    doc.appendChild(comp);

    let btn           = await comp.query('#inc');
    let btnSticky     = await comp.query('#incSticky');
    let display       = await comp.query('#display');
    let displaySticky = await comp.query('#displaySticky');

    expect(lifecycles).to.deep.eq(['added', 'rendered']);
    expect(display.innerText).to.be.eq('0');
    expect(displaySticky.innerText).to.be.eq('100');

    btn.click(); expect(display.innerText).to.be.eq('1');
    btn.click(); expect(display.innerText).to.be.eq('2');

    btnSticky.click(); expect(displaySticky.innerText).to.be.eq('101');
    btnSticky.click(); expect(displaySticky.innerText).to.be.eq('102');

    doc.removeChild(comp);

    expect(lifecycles).to.deep.eq(['added', 'rendered', 'removed']);

    expect(display.innerText).to.be.eq('2');

    console.log(lifecycles);
    doc.appendChild(comp);

    console.log(lifecycles);
    expect(lifecycles).to.deep.eq([
      'added', 'rendered', 'removed', 'added', 'rendered'
    ]);

    btn           = await comp.query('#inc');
    btnSticky     = await comp.query('#incSticky');
    display       = await comp.query('#display');
    displaySticky = await comp.query('#displaySticky');

    expect(display.innerText).to.be.eq('0');
    expect(displaySticky.innerText).to.be.eq('102');

    btn.click(); expect(display.innerText).to.be.eq('1');
    btnSticky.click(); expect(displaySticky.innerText).to.be.eq('103');
  }));

})

