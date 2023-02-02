import { test, expect } from '@jest/globals';
import Html from "html";
import { Subject } from "rx";
import Component from "component";
import { testDoc } from './util';


interface Events {
  'customEvtString': string,
  'customEvtNumber': {hi: string, iAmAnObject: boolean},
}

export class EventEmitter extends Component<Events> {

  render = () => [
    Html.FieldSet([
      Html.Legend('Event Emitter'),
      Html.Button({
        attrs: { id: "evt-string" },
        events: {
          click: () => this.dispatch('customEvtString', 'event value')
        }
      }, 'Emit Event String'),
      Html.Button({
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
  private state = new Subject('initial');

  render = () => [
    Html.FieldSet([
      Html.Legend('Event Receiver'),
      Html.P({ attrs: { id: 'state' }}, this.state),
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
