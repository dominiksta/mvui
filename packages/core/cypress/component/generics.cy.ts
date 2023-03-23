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

    // this test has no actual code in it, it should simply compile.
    expect(true).to.be.true;
  }));
})

