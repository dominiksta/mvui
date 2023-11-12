import { Component, h, rx, style } from '$thispkg';
import { attempt, mount } from '../support/helpers';

const SOME_SHARED_STYLES = style.sheet({
  'button': {
    'background': 'yellow', // will be overwritten by the component style sheet
    'padding': '10px',
  }
});

class ThirdPartyComponent extends HTMLElement {
  private connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML =
      `<div>Third Party Component <button>With a Button</button></div>`;
  }
}
customElements.define('third-party-component', ThirdPartyComponent);

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

  render() {
    return [
      h.fieldset([
        h.legend('Styled Component'),
        h.button({
          events: {
            click: _ => {
              this.styles.next(style.sheet({
                'button': {
                  background: 'brown !important',
                }
              }));
            }
          }
        }, 'Styled Button'),
        h.span(
          'The button will be round on larger screens to demonstrate media queries'
        )
      ]),
      h.fieldset([
        h.legend('Piercing Shadow DOM in Third Party Components'),
        h.custom(ThirdPartyComponent)()
      ])
    ]
  }
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

    const thirdParty = await childComp.query<ThirdPartyComponent>('third-party-component');
    const btnThirdParty = thirdParty.shadowRoot!.querySelector('button')!;
    expect(getComputedStyle(btnThirdParty).color).to.be.eq('rgb(0, 0, 0)');
  });

  it('pierce shadow dom', async () => {
    @Component.register
    class ShadowDOMPiercingComponent extends Component {

      static styles = style.sheet({
        'button': {
          background: 'white !important',
        }
      });

      pierceShadow = style.sheet({
        'button': {
          background: 'green',
          color: 'white',
        },
      });

      render() {
        return [
          StyledComponent.t()
        ]
      }
    }

    const comp = mount(ShadowDOMPiercingComponent);
    const styled = await comp.query<StyledComponent>('app-styled-component');
    const btn = await styled.query<HTMLButtonElement>('button');
    expect(getComputedStyle(btn).backgroundColor).to.be.eq('rgb(255, 0, 0)');
    expect(getComputedStyle(btn).color).to.be.eq('rgb(255, 255, 255)');

    const thirdParty = await styled.query<ThirdPartyComponent>('third-party-component');
    const btnThird = thirdParty.shadowRoot!.querySelector('button')!;
    expect(getComputedStyle(btnThird).backgroundColor).to.be.eq('rgb(0, 128, 0)');
    expect(getComputedStyle(btnThird).color).to.be.eq('rgb(255, 255, 255)');
  });
})
