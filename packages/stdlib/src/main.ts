import { Component, h, rx } from "@mvui/core";
import Button from "button";
import * as std from "./index";

class Main extends Component {
  #state = new rx.Binding('initial');

  render = () => [
    std.Input.new({ props: { value: this.#state }}),
    std.Input.new({ props: { value: this.#state }}),
    h.div(this.#state),
    h.button({ events: { click: _ => this.#state.next('intial') }}, 'reset')
  ]
}
Main.register();

document.body.appendChild(new Main());
