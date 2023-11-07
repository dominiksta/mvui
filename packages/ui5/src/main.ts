import { Component, h, rx } from "@mvui/core";
import AvatarColorScheme from "@ui5/webcomponents/dist/types/AvatarColorScheme";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import ToastPlacement from "@ui5/webcomponents/dist/types/ToastPlacement";
import * as ui5 from "./index";

ui5.config.setTheme('sap_horizon');
ui5.config.setGlobalCompact(false);

class Main extends Component {
  #toasty = this.query<ui5.types.Toast>('#toasty');

  #busy = new rx.State(false);

  #bound = new rx.State('initial');

  render = () => [
    h.fieldset([
      h.legend('data binding'),
      ui5.input({ fields: { value: rx.bind(this.#bound) }}),
      h.input({ fields: { value: rx.bind(this.#bound) }}),
      h.span(this.#bound.map(v => `bound: ${v}`)),
      ui5.button({ events: {
        click: _ => this.#bound.next('initial')}}, 'Reset'
      ),
    ]),
    h.fieldset([
      h.legend('avatars'),
      ui5.avatar({ fields: { icon: 'employee', colorScheme: AvatarColorScheme.Accent3 } }),
    ]),
    h.fieldset([
      h.legend('toasts'),
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
    ui5.avatarGroup({ events: { click: e => e }}, [
      ui5.avatar({ fields: { icon: 'employee' }})
    ]),
    h.fieldset([
      h.legend('busy indicator'),
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
    ])
  ]
}
Main.register();

document.body.appendChild(new Main());
