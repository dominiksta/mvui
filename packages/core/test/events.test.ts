import { test, expect } from '@jest/globals';
import h from "html";
import { State } from "rx";
import Component from "component";
import { testDoc } from './util';

interface Events {
  'customClick': MouseEvent,
  'customEvtString': CustomEvent<string>,
  'customEvtObject': CustomEvent<{hi: string, iAmAnObject: boolean}>,
}

export class EventEmitter extends Component<Events> {

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
EventEmitter.register();


export class EventReceiver extends Component {
  state = new State<Event>(new CustomEvent(''));

  render() {
    return [
      h.fieldset([
        h.legend('Event Receiver'),
        h.p({ attrs: { id: 'state' } }, this.state),
        EventEmitter.new({
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
EventReceiver.register();


test('custom events', async () => {
  const [_, comp] = testDoc(new EventReceiver());
  const emitter = await comp.query<EventEmitter>('app-event-emitter');
  const emitterString = await emitter.query('button#evt-string');
  const emitterObject = await emitter.query('button#evt-object');
  const emitterMouseEvt = await emitter.query('button#evt-mouse-evt');

  expect(comp.state.value.type).toBe('');
  emitterString.click();
  expect(comp.state.value.type).toBe('customEvtString');
  emitterObject.click();
  expect(comp.state.value.type).toBe('customEvtObject');
  emitterMouseEvt.click();
  expect(comp.state.value.type).toBe('customClick');
})
