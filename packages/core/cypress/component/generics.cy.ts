import { Component, rx } from '$thispkg';
import { attempt } from '../support/helpers';

describe('generic components', () => {
  it('generic components', attempt(async () => {

    class GenericComp<T> extends Component<{
      events: {
        change: T
      }
    }> {
      props = {
        value: rx.prop<T>({optional: true})
      }
      render = () => [];
    }

    class UserComp extends Component {
      render() {
        const state1 = new rx.State(0);
        const state2 = new rx.State('hi');
        return [
          (GenericComp<number>).t({
            props: { value: state1 },
            events: { change: e => state1.next(e) }
          }),
          (GenericComp<string>).t({
            props: { value: state2 },
            events: { change: e => state2.next(e) }
          })
        ]
      }
    }

    // this test has no actual code in it, it should simply compile.
    expect(true).to.be.true;
  }));
})

