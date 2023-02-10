import { test, expect } from '@jest/globals';
import h from "html";
import { BehaviourSubject } from "rx";
import Component from "component";
import { testDoc } from './util';


interface Events {
  'customEvtString': string,
  'customEvtNumber': {hi: string, iAmAnObject: boolean},
}

export class EventEmitter extends Component<Events> {

  render = () => [
    h.fieldset([
      h.legend('Event Emitter'),
      h.button({
        attrs: { id: "evt-string" },
        events: {
          click: () => this.dispatch('customEvtString', 'event value')
        }
      }, 'Emit Event String'),
      h.button({
        attrs: { id: "evt-object" },
        events: {
          click: () => this.dispatch('customEvtNumber', {
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
  private state = new BehaviourSubject('initial');

  render = () => [
    h.fieldset([
      h.legend('Event Receiver'),
      h.p({ attrs: { id: 'state' }}, this.state),
      EventEmitter.new({
        events: {
          // we put the click event in here additionally to test the types
          click: (_e) => {
            // console.log('EventEmitter was clicked')
          },
          customEvtString: (e) => this.state.next(e.detail),
          customEvtNumber: (e) => this.state.next(JSON.stringify(e.detail)),
        }
      })
    ])
  ];
  
}
EventReceiver.register();


test('custom events', async () => {
  const [_, comp] = testDoc(new EventReceiver());
  const state = await comp.query('#state');
  const emitter = await comp.query<EventEmitter>('mvui-event-emitter');
  const emitterString = await emitter.query('button#evt-string');
  const emitterObject = await emitter.query('button#evt-object');

  expect(state.innerText).toBe('initial');
  emitterString.click();
  expect(state.innerText).toBe('event value');
  emitterObject.click();
  expect(state.innerText).toBe('{"hi":"world","iAmAnObject":true}');
})
