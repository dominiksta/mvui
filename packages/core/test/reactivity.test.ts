import { test, expect } from '@jest/globals';
import { BehaviourSubject } from "rx";
import Component from "component";
import h from "html";
import { fromLatest } from "rx/operators";
import { testDoc } from './util';

class CounterComponent extends Component {
  private count = new BehaviourSubject(0);
  private multiplier = new BehaviourSubject(1);
  private sum = fromLatest(this.count, this.multiplier);

  render = () => [
    h.fieldset([
      h.legend('Child Component: Reactivity'),
      h.p('This is a "reactive" Counter'),
      h.button({
        attrs: { id: 'inc-count' },
        events: {
          click: () => this.count.next(this.count.value + 1)
        }
      }, 'Increase Count'),
      h.button({
        attrs: { id: 'inc-mult' },
        events: {
          click: () => this.multiplier.next(this.multiplier.value + 1)
        }
      }, 'Increase Multiplier'),
      h.span(
        { attrs: { id: 'state' }},
        this.sum.map(([c, m]) => `${c} * ${m} = ${c * m}`)
      ),
    ])
  ];
}
CounterComponent.register();

test('basic reactivity (counter)', async () => {
  const [_, comp] = testDoc(new CounterComponent());
  const state = await comp.query('#state');
  const btnIncCount = await comp.query('#inc-count');
  const btnIncMult = await comp.query('#inc-mult');
  expect(state.innerText).toBe('0 * 1 = 0');

  btnIncCount.click(); expect(state.innerText).toBe('1 * 1 = 1');
  btnIncCount.click(); expect(state.innerText).toBe('2 * 1 = 2');

  btnIncMult.click();  expect(state.innerText).toBe('2 * 2 = 4');
  btnIncMult.click();  expect(state.innerText).toBe('2 * 3 = 6');

  btnIncCount.click(); expect(state.innerText).toBe('3 * 3 = 9');
  btnIncCount.click(); expect(state.innerText).toBe('4 * 3 = 12');
});


class ReactiveList extends Component {
  private list = new BehaviourSubject(['item 1', 'item 2']);
  private counter = new BehaviourSubject(0);

  render = () => [
    h.fieldset([
      h.legend('Child Component: Reactive List'),
      h.button({
        attrs: { id: 'inc-counter' },
        events: {
          click: () => {
            this.counter.next(this.counter.value + 1)
          }
        }
      }, 'Increment Counter'),
      h.button({
        attrs: { id: 'add-new-el' },
        events: {
          click: () => {
            this.list.next([
              ...this.list.value, 'item ' + (this.list.value.length + 1)
            ])
          }
        }
      }, 'Add a new list element'),
      h.ul(
        { attrs: { id: 'static-els' }},
        this.list.map(v => v.map(v => h.li(v)))
      ),
      h.ul(
        { attrs: { id: 'reactive-els' }},
        this.list.map(v => v.map(() => h.li(this.counter)))
      ),
    ])
  ];
}
ReactiveList.register();

test('reactive list', async () => {
  const [_, comp] = testDoc(new ReactiveList());
  const btnIncCount = await comp.query('#inc-counter');
  const btnAddEl = await comp.query('#add-new-el');

  const staticEls = await comp.query('#static-els');
  const reactiveEls = await comp.query('#reactive-els');

  const check = (counter: number, elCount: number) => {
    expect(staticEls.children.length).toBe(elCount);
    expect(reactiveEls.children.length).toBe(elCount);
    for (let child of reactiveEls.children) {
      expect((child as HTMLLIElement).innerText).toBe(counter);
    }
  };

  check(0, 2);
  btnIncCount.click();
  check(1, 2);
  btnAddEl.click();
  check(1, 3);
  btnAddEl.click(); btnAddEl.click();
  btnIncCount.click(); btnIncCount.click();
  check(3, 5);
});

class EditableList extends Component {
  private editableList = new BehaviourSubject([
    { name: 'name1', value: 'val1' },
    { name: 'name2', value: 'val2' },
  ]);

  render = () => [
    h.button({
      attrs: { id: 'btn-new-el' },
      events: { click: () => {
      this.editableList.next([
        ...this.editableList.value, {
          name: `name${this.editableList.value.length + 1}`,
          value: `val${this.editableList.value.length + 1}`,
        }
      ]);
    }}}, 'Add new element'),
    h.ul(
      { attrs: { id: 'list' }},
      this.editableList.map(s => s.length).map(() =>
        this.editableList.value.map((v, i) =>
          h.li([
            h.span(v.name + ' :'),
            h.input({
              attrs: { value: v.value },
              events: {
                change: e => {
                  this.editableList.value[i].value = e.target.value;
                  this.editableList.next(this.editableList.value);
                }
              }
            }),
            h.button({
              style: { color: 'red' },
              events: { click: () => {
                this.editableList.value.splice(i, 1);
                // console.log(this.editableList.value);
                this.editableList.next(this.editableList.value);
              }}
            }, 'x')
          ])
        )
      )
    ),
  ]
}
EditableList.register();


test('editable list', async () => {
  const [_, comp] = testDoc(new EditableList());

  const list = await comp.query('#list');
  const btnNewEl = await comp.query('#btn-new-el');

  const check = (desc: {value: string, name: string}[]) => {
    for (let i = 0; i < desc.length; i++) {
      const li = list.children[i] as HTMLLIElement;
      const name = li.querySelector('span')?.innerText;
      const value = li.querySelector('input')?.value;
      expect(name).toBe(desc[i].name + ' :');
      expect(value).toBe(desc[i].value);
    }
  };

  check([
    { name: 'name1', value: 'val1' },
    { name: 'name2', value: 'val2' },
  ]);

  btnNewEl.click();

  check([
    { name: 'name1', value: 'val1' },
    { name: 'name2', value: 'val2' },
    { name: 'name3', value: 'val3' },
  ]);

  list.children[1].querySelector<HTMLButtonElement>('button')?.click();

  check([
    { name: 'name1', value: 'val1' },
    { name: 'name3', value: 'val3' },
  ]);

  btnNewEl.click();

  check([
    { name: 'name1', value: 'val1' },
    { name: 'name3', value: 'val3' },
    { name: 'name3', value: 'val3' },
  ]);

  list.children[1].querySelector<HTMLButtonElement>('input')!.value =
    'changed value';

  check([
    { name: 'name1', value: 'val1' },
    { name: 'name3', value: 'changed value' },
    { name: 'name3', value: 'val3' },
  ]);
});
