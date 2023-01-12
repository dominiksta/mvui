import Html from "../html";
import Component from "../component";

const SOME_SHARED_STYLES = {
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
}

export class StyledComponent extends Component {
  static styles = Component.css([
    SOME_SHARED_STYLES,
    {
      '*': {
        background: 'blue',
        color: 'white',
      },
      'button': {
        background: 'red',
      },
      'button:active': {
        background: 'green',
      },
    },
  ])

  render = () => [
    Html.FieldSet([
      Html.Legend('Styled Component'),
      Html.Button({
        events: { click: _ => {
          this.styles.next({
            'button': {
              background: 'brown !important',
            }
          });
        }}
      }, 'Styled Button')
    ])
  ]

  onRender() { console.log((this.constructor as any).styles)}
}
StyledComponent.register();
