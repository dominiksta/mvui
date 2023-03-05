import { test, expect } from '@jest/globals';
import Component from 'component';
import { rx } from 'index';

test('generic components', async () => {

  class GenericComp<T> extends Component<{
    events: {
      change: T
    }
  }> {
    props = {
      value: new rx.Prop<T | undefined>(undefined)
    }
    render = () => [];
  }

  class UserComp extends Component {
    render() {
      const state1 = new rx.State(0);
      const state2 = new rx.State('hi');
      return [
        (GenericComp<number>).new({
          props: { value: state1 },
          events: { change: e => state1.next(e) }
        }),
        (GenericComp<string>).new({
          props: { value: state2 },
          events: { change: e => state2.next(e) }
        })
      ]
    }
  }

  // TODO: this test has no actual code in it, it should simply compile. for that we must
  // make sure that in the future tests fail when typescript is not happy about them.

  expect(true).toBe(true);

});
