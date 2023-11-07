import { Component, h, rx, style } from "@mvui/core";
import AvatarColorScheme from "@ui5/webcomponents/dist/types/AvatarColorScheme";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import ToastPlacement from "@ui5/webcomponents/dist/types/ToastPlacement";
import * as ui5 from ".";

// ui5.config.setTheme('sap_horizon');
ui5.config.setGlobalCompact(false);
ui5.config.setAnimationMode('none');
ui5.config.setLanguage('en');

@Component.register
class Main extends Component {
  #toasty = this.query<ui5.types.Toast>('#toasty');
  #busy = new rx.State(false);
  #bound = new rx.State('initial');

  render() {
    const date = new rx.State('2023-02-12');

    const dialogOpen = new rx.State(false);

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

      ui5.panel({ fields: { headerText: 'checkbox', collapsed: true } }, [
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
        ]),
        ui5.button({ events: { click: async e => {
          (await this.query<ui5.types.ColorPalettePopover>('#color-palette')).showAt(
            e.target as HTMLElement
          )
        }}}, 'Open Popover'),
        ui5.colorPalettePopover({ fields: { id: 'color-palette' }}, [
          ui5.colorPaletteItem({ fields: { value: 'red' }}),
          ui5.colorPaletteItem({ fields: { value: 'green' }}),
          ui5.colorPaletteItem({ fields: { value: 'blue' }}),
        ])
      ]),

      ui5.panel({ fields: { headerText: 'color picker', collapsed: true } }, [
        ui5.colorPicker({ events: { change: e => console.log(e) }})
      ]),

      ui5.panel({ fields: { headerText: 'combo box', collapsed: true } }, [
        ui5.comboBox({ fields: { placeholder: 'Placeholder' }}, [
          ui5.comboBoxGroupItem({ fields: { text: 'A' }}),
          ui5.comboBoxItem({ fields: { text: 'Argentina' }}),
          ui5.comboBoxItem({ fields: { text: 'Australia' }}),
          ui5.comboBoxGroupItem({ fields: { text: 'B' }}),
          ui5.comboBoxItem({ fields: { text: 'Bahrain' }}),
          ui5.comboBoxItem({ fields: { text: 'Belgium' }}),
        ]),
        ui5.multiComboBox({ fields: { placeholder: 'Placeholder' }}, [
          ui5.multiComboBoxGroupItem({ fields: { text: 'A' }}),
          ui5.multiComboBoxItem({ fields: { text: 'Argentina' }}),
          ui5.multiComboBoxItem({ fields: { text: 'Australia' }}),
          ui5.multiComboBoxGroupItem({ fields: { text: 'B' }}),
          ui5.multiComboBoxItem({ fields: { text: 'Bahrain' }}),
          ui5.multiComboBoxItem({ fields: { text: 'Belgium' }}),
        ])
      ]),

      ui5.panel({ fields: { headerText: 'date picker', collapsed: true } }, [
        ui5.datePicker({ fields: { value: rx.bind(date), formatPattern: 'yyyy-MM-dd' }}),
        h.span(date),
        ui5.dateTimePicker(),
        ui5.dateRangePicker(),
      ]),

      ui5.panel({ fields: { headerText: 'dialog', collapsed: true } }, [
        ui5.button({ events: { click: _ => dialogOpen.next(v => !v) }}, 'Open'),
        ui5.dialog({
          fields: { open: rx.bind(dialogOpen )},
          slots: {
            footer: [
             ui5.button({ events: { click: _ => dialogOpen.next(false) }}, 'Close') 
            ]
          }
        }, [
          'Content'
        ]),
      ]),

      ui5.panel({ fields: { headerText: 'icons', collapsed: true } }, [
        ui5.icon({ fields: { name: 'activities' }}),
        ui5.icon({ fields: { name: 'tnt/actor' }}),
        ui5.icon({ fields: { name: 'business-suite/icon-activity' }}),
      ]),

      ui5.panel({ fields: { headerText: 'input', collapsed: true } }, [
        ui5.label({ fields: { for: 'autocomplete-input' }}, 'Label '),
        ui5.input({ fields: {
          id: 'autocomplete-input',
          showSuggestions: true,
        }}, [
          ui5.suggestionItem('Australia'),
          ui5.suggestionItem('Germany'),
          ui5.suggestionItem('Zimbabwe'),
        ]),
      ]),

      ui5.panel({ fields: { headerText: 'list', collapsed: true } }, [
        ui5.list([
          ui5.li('Li1'),
          ui5.li('Li2'),
        ])
      ]),

      ui5.panel({ fields: { headerText: 'menu', collapsed: true } }, [
        ui5.button({
          fields: { design: ButtonDesign.Attention },
          events: {
            click: async e => {
              (await this.query<ui5.types.Menu>('#menu')).showAt(e.target as HTMLElement)
            }
          }
        }, 'Show Menu'),

        ui5.menu({ fields: { id: 'menu' } }, [
          ui5.menuItem({ fields: { text: 'Li1' }}),
          ui5.menuItem({ fields: { text: 'Li2' }}),
          ui5.menuItem({ fields: { text: 'Nest' }}, [
            ui5.menuItem({ fields: { text: 'Nest1' } }),
            ui5.menuItem({ fields: { text: 'Nest2' } }),
          ]),
        ])
      ]),

      ui5.panel({ fields: { headerText: 'message strip', collapsed: true } }, [
        ui5.messageStrip('message')
      ]),

    ]
  } 

  static styles = style.sheet({
    ':host': {
      // display: 'grid',
      // gridTemplateColumns: '1fr 1fr',
    },
    'ui5-panel': {
      margin: '10px',
    }
  })
}

style.currentTheme$.subscribe(theme => {
  ui5.config.setTheme(theme === 'light' ? 'sap_horizon' : 'sap_horizon_dark');
  document.body.style.background = theme === 'light' ? '#F5F6F7' : '#12171C';
  document.body.style.color = theme === 'light' ? 'black' : 'white';
})

document.body.appendChild(new Main());
