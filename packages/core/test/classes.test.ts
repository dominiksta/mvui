import { test, expect } from '@jest/globals';
import Component from 'component';
import { h, rx } from 'index';
import { testDoc } from './util';

test('classList', async () => {

  const klass3 = new rx.State(false);

  class ClassListTest extends Component {
    render() {
      return [
        h.div({ classes: {
          klass1: true,
          klass2: false,
          klass3
        }})
      ]
    }
  }
  ClassListTest.register();

  const [_, comp] = testDoc(new ClassListTest());
  const el = await comp.query('div');

  expect(el.classList.contains('klass1')).toBe(true);
  expect(el.classList.contains('klass2')).toBe(false);
  expect(el.classList.contains('klass3')).toBe(false);

  klass3.next(true);

  expect(el.classList.contains('klass1')).toBe(true);
  expect(el.classList.contains('klass2')).toBe(false);
  expect(el.classList.contains('klass3')).toBe(true);
});
