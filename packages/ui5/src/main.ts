import { Component, h, rx, style } from "@mvui/core";
import AvatarColorScheme from "@ui5/webcomponents/dist/types/AvatarColorScheme";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import ToastPlacement from "@ui5/webcomponents/dist/types/ToastPlacement";
import * as ui5 from ".";

ui5.config.setTheme('sap_horizon');
ui5.config.setGlobalCompact(false);
ui5.config.setAnimationMode('none');

@Component.register
class Main extends Component {
  #toasty = this.query<ui5.types.Toast>('#toasty');
  #busy = new rx.State(false);
  #bound = new rx.State('initial');

  render() {
    return [
      ui5.panel({ fields: { headerText: 'data binding', collapsed: true } }, [
        ui5.input({ fields: { value: rx.bind(this.#bound) } }),
        h.input({ fields: { value: rx.bind(this.#bound) } }),
        h.span(this.#bound.map(v => `bound: ${v}`)),
        ui5.button({
          events: {
            click: _ => this.#bound.next('initial')
          }
        }, 'Reset'
        ),
      ]),
      ui5.panel({ fields: { headerText: 'avatars', collapsed: true } }, [
        ui5.avatar({ fields: { icon: 'employee', colorScheme: AvatarColorScheme.Accent3 } }),
        ui5.avatarGroup({ events: { click: e => e } }, [
          ui5.avatar({ fields: { icon: 'employee' } }),
          ui5.avatar({ fields: { icon: 'employee' } }),
        ]),
      ]),
      ui5.panel({ fields: { headerText: 'toasts', collapsed: true } }, [
        ui5.button({
          fields: { design: ButtonDesign.Attention },
          events: {
            click: async _ => { (await this.#toasty).show() }
          }
        }, 'Show Toast'),
        ui5.toast({
          attrs: { id: 'toasty' },
          fields: { placement: ToastPlacement.TopCenter }
        },
          'Hi from Toast'
        )]
      ),
      ui5.panel({ fields: { headerText: 'busy indicator', collapsed: true } }, [
        h.div(
          ui5.button({
            events: {
              click: _ => {
                this.#busy.next(true);
                console.log(this.#busy.value);
                setTimeout(() => this.#busy.next(false), 1000);
              }
            }
          }, 'Do Work')),
        ui5.busyIndicator(
          { fields: { active: this.#busy, delay: 100 } },
          h.div('Potentially Busy Content')
        )
      ]),
      
      ui5.panel({ fields: { headerText: 'calendar', collapsed: true } }, [
        ui5.calendar({ events: {
          'selected-dates-change': e => console.log(e)
        }}, [ ui5.calendarDate({ fields: { value: '05.11.2023' }}) ])
      ]),

      
      ui5.panel({ fields: { headerText: 'card', collapsed: true } }, [
        ui5.card({
          slots: { header: ui5.cardHeader({ fields: {
            titleText: 'Title', subtitleText: 'SubTitle'
          }}) },
        }, [
          h.span({ style: { margin: '10px' } }, 'Card content')
        ])
      ]),

      ui5.panel({ fields: { headerText: 'carousel', collapsed: true } }, [
        ui5.carousel([
          h.img({ fields: { src: 'https://sap.github.io/ui5-webcomponents/assets/images/sample1.jpg'}}),
          h.img({ fields: { src: 'https://sap.github.io/ui5-webcomponents/assets/images/sample2.jpg'}}),
          h.img({ fields: { src: 'https://sap.github.io/ui5-webcomponents/assets/images/sample3.jpg'}}),
        ])
      ]),

      ui5.panel({ fields: { headerText: 'carousel', collapsed: true } }, [
        ui5.checkbox({ fields: { text: 'Default'}}),
        ui5.checkbox({ fields: { text: 'Success', valueState: 'Success' }}),
        ui5.checkbox({ fields: { text: 'Error', valueState: 'Error' }}),
        ui5.checkbox({ fields: { text: 'Disabled', disabled: true }}),
      ]),

      ui5.panel({ fields: { headerText: 'color palette', collapsed: true } }, [
        ui5.colorPalette([
          ui5.colorPaletteItem({ fields: { value: 'red' }}),
          ui5.colorPaletteItem({ fields: { value: 'green' }}),
          ui5.colorPaletteItem({ fields: { value: 'blue' }}),
        ])
      ]),

    ]
  } 

  static styles = style.sheet({
    ':host': {
      // display: 'grid'
    },
    'ui5-panel': {
      margin: '10px',
    }
  })
}

document.body.style.background = '#F5F6F7';
document.body.appendChild(new Main());
