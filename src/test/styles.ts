import Html from "html";
import Component from "component";
import Styling from "styling";

const SOME_SHARED_STYLES = Styling.SimpleSheet({
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
});

export class StyledComponent extends Component {
  static styles = [
    ...SOME_SHARED_STYLES,
    ...Styling.SimpleSheet({
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
    }),
    Styling.At.Media('screen and (min-width: 900px)', Styling.SimpleSheet({
      'button': {
        borderRadius: '10px',
      }
    })),
  ]

  render = () => [
    Html.FieldSet([
      Html.Legend('Styled Component'),
      Html.Button({
        events: { click: _ => {
          this.styles.next(Styling.SimpleSheet({
            'button': {
              background: 'brown !important',
            }
          }));
        }}
      }, 'Styled Button'),
      Html.Span(
        'The button will be round on larger screens to demonstrate media queries'
      )
    ])
  ]

  // onRender() { console.log((this.constructor as any).styles)}
}
StyledComponent.register();
