import { Component, h, rx } from "@mvui/core";
import * as std from "./index";

class Main extends Component {
  #state = new rx.State('initial');

  render = () => [
    std.Input.new({ props: { value: rx.bind(this.#state) }}),
    h.input({ fields: { value: rx.bind(this.#state) }}),
    h.input({ fields: { value: rx.bind(this.#state) }}),
    h.div(this.#state),
    h.button({ events: { click: _ => this.#state.next('intial') }}, 'reset')
  ]
}
Main.register();

document.body.appendChild(new Main());
