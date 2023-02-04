import { test, expect } from '@jest/globals';
import h from "html";
import Component from "component";
import Styling from "styling";

const SOME_SHARED_STYLES = Styling.SimpleSheet({
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
});

export class StyledComponent extends Component {

  // while the styling in mvui works with or without using a shadow dom, it does
  // not seem to work when using a shadow dom in jests jsdom environment. there
  // is likely no easy way to automatically test styling components in a shadow dom
  static useShadow = false;

  static styles = [
    ...SOME_SHARED_STYLES,
    ...Styling.SimpleSheet({
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
    h.fieldset([
      h.legend('Styled Component'),
      h.button({
        events: { click: _ => {
          this.styles.next(Styling.SimpleSheet({
            'button': {
              background: 'brown !important',
            }
          }));
        }}
      }, 'Styled Button'),
      h.span(
        'The button will be round on larger screens to demonstrate media queries'
      )
    ])
  ]
}
StyledComponent.register();

test('slots', async () => {
  const comp = new StyledComponent(); document.body.appendChild(comp);

  const btn = await comp.query<HTMLButtonElement>('button');

  expect(getComputedStyle(btn).padding).toBe('10px');

  expect(getComputedStyle(btn).background).toBe('red');
  btn.click();
  expect(getComputedStyle(btn).background).toBe('brown');
  
  document.body.removeChild(comp);
});
