import { Component, h, rx } from "$thispkg";
import { mount } from "../support/helpers";

@Component.register
export class EventEmitter extends Component<{
  events: {
    'customClick': MouseEvent,
    'customEvtString': CustomEvent<string>,
    'customEvtObject': CustomEvent<{ hi: string, iAmAnObject: boolean }>,
  }
}> {

  render = () => [
    h.fieldset([
      h.legend('Event Emitter'),
      h.button({
        attrs: { id: "evt-mouse-evt" },
        events: {
          click: (e) => {
            this.reDispatch('customClick', e)
          }
        }
      }, 'Emit MouseEvent'),
      h.button({
        attrs: { id: "evt-string" },
        events: {
          click: () => this.dispatch('customEvtString', 'event value')
        }
      }, 'Emit Event String'),
      h.button({
        attrs: { id: "evt-object" },
        events: {
          click: () => this.dispatch('customEvtObject', {
            hi: 'world', iAmAnObject: true
          })
        }
      }, 'Emit Event Object'),
    ]
    )
  ];
  
}


@Component.register
export class EventReceiver extends Component {
  state = new rx.State<Event>(new CustomEvent(''));

  render() {
    return [
      h.fieldset([
        h.legend('Event Receiver'),
        h.p({ attrs: { id: 'state' } }, this.state),
        EventEmitter.t({
          events: {
            // we put the click event in here additionally to test the types
            customClick: (e) => this.state.next(e),
            customEvtString: (e) => this.state.next(e),
            customEvtObject: (e) => this.state.next(e),
          }
        })
      ])
    ];
  };
  
}

describe('custom events', () => {
  it('kinda works', async () => {
    const comp = mount(EventReceiver);
    const emitter = await comp.query<EventEmitter>('app-event-emitter');
    const emitterString = await emitter.query('button#evt-string');
    const emitterObject = await emitter.query('button#evt-object');
    const emitterMouseEvt = await emitter.query('button#evt-mouse-evt');

    expect(comp.state.value.type).to.be.eq('');
    emitterString.click();
    expect(comp.state.value.type).to.be.eq('customEvtString');
    emitterObject.click();
    expect(comp.state.value.type).to.be.eq('customEvtObject');
    emitterMouseEvt.click();
    expect(comp.state.value.type).to.be.eq('customClick');
  })
})

