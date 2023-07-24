import { Component, h, rx } from '$thispkg';
import { attempt, mount } from '../support/helpers';

describe('setting css classes', () => {
  it('kinda works', attempt(async () => {

    const klass3 = new rx.State(false);

    @Component.register
    class ClassListTest extends Component {
      render() {
        return [
          h.div({
            classes: {
              klass1: true,
              klass2: false,
              klass3
            }
          })
        ]
      }
    }

    const comp = mount(ClassListTest);
    const el = await comp.query('div');

    expect(el.classList.contains('klass1')).to.be.true;
    expect(el.classList.contains('klass2')).to.be.false;
    expect(el.classList.contains('klass3')).to.be.false;

    klass3.next(true);

    expect(el.classList.contains('klass1')).to.be.true;
    expect(el.classList.contains('klass2')).to.be.false;
    expect(el.classList.contains('klass3')).to.be.true;
  }));

})

