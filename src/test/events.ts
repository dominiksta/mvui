import Html from "html";
import { Subject } from "observables";
import Component from "component";


interface Events {
  'customEvtString': string,
  'customEvtNumber': {hi: string, iAmAnObject: boolean},
}

export class EventEmitter extends Component<Events> {

  render = () => [
    Html.FieldSet([
      Html.Legend('Event Emitter'),
      Html.Button({
        events: {
          click: () => this.dispatch('customEvtString', 'event value')
        }
      }, 'Emit Event String'),
      Html.Button({
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
      Html.P(this.state),
      EventEmitter.new({
        events: {
          // we put the click event in here additionally to test the types
          click: (_e) => console.log('EventEmitter was clicked'),
          customEvtString: (e) => this.state.next(e.detail),
          customEvtNumber: (e) => this.state.next(JSON.stringify(e.detail)),
        }
      })
    ])
  ];
  
}
EventReceiver.register();
