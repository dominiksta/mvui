import { test, expect } from '@jest/globals';
import h from "html";
import Component from "component";
import * as style from "style";

const SOME_SHARED_STYLES = style.sheet({
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
});

class StyledComponent extends Component {

  // while the styling in mvui works with or without using a shadow dom, it does
  // not seem to work when using a shadow dom in jests jsdom environment. there
  // is likely no easy way to automatically test styling components in a shadow dom
  static useShadow = false;

  static styles = [
    ...SOME_SHARED_STYLES,
    ...style.sheet({
      'button': {
        background: 'red',
      },
      'button:active': {
        background: 'green',
      },
    }),
    style.at.media('screen and (min-width: 900px)', style.sheet({
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
          this.styles.next(style.sheet({
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

test('basic styling', async () => {
  const comp = new StyledComponent(); document.body.appendChild(comp);

  const btn = await comp.query<HTMLButtonElement>('button');

  expect(getComputedStyle(btn).padding).toBe('10px');

  expect(getComputedStyle(btn).background).toBe('red');
  btn.click();
  expect(getComputedStyle(btn).background).toBe('brown');

  document.body.removeChild(comp);
});

// We sadly cannot test style overrides because it would require jests jsdom to work with
// shadow dom.

// test('style overrides', async () => {
//   class StyleOverridingComponent extends Component {
//     render() {
//       return [
//         StyledComponent.new({
//           styleOverrides: style.sheet({
//             'button': {
//               background: 'blue'
//             }
//           })
//         })
//       ]
//     }
//   }
//   StyleOverridingComponent.register();
// 
//   const comp = new StyleOverridingComponent(); document.body.appendChild(comp);
// 
//   const childComp = await comp.query<StyledComponent>('styled-component');
//   const btn = await childComp.query<HTMLButtonElement>('button');
// 
//   expect(getComputedStyle(btn).padding).toBe('blue');
// });
