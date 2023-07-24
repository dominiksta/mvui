import { Component, h, style } from '$thispkg';
import { attempt, mount } from '../support/helpers';

const SOME_SHARED_STYLES = style.sheet({
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
});

@Component.register
class StyledComponent extends Component {

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

describe('styling', () => {
  it('basic styling', attempt(async () => {
    const comp = new StyledComponent(); document.body.appendChild(comp);

    const btn = await comp.query<HTMLButtonElement>('button');

    expect(getComputedStyle(btn).padding).to.be.eq('10px');

    expect(getComputedStyle(btn).backgroundColor)
      .to.be.eq('rgb(255, 0, 0)');
    btn.click();
    expect(getComputedStyle(btn).backgroundColor)
      .to.be.eq('rgb(165, 42, 42)');

    document.body.removeChild(comp);
  }));

  it('style overrides', async () => {
    @Component.register
    class StyleOverridingComponent extends Component {
      render() {
        return [
          StyledComponent.t({
            styleOverrides: style.sheet({
              'button': {
                // HACK this should ideally work without !important
                background: 'blue !important'
              }
            })
          })
        ]
      }
    }

    const comp = mount(StyleOverridingComponent);

    const childComp = await comp.query<StyleOverridingComponent>('app-styled-component');
    const btn = await childComp.query<HTMLButtonElement>('button');

    expect(getComputedStyle(btn).backgroundColor).to.be.eq('rgb(0, 0, 255)');
  });

})
