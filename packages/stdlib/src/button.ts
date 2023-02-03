import { Component, h, rx } from "@mvui/core";

/**
 * This is a really cool button.
 */
export default class Button extends Component {
  #counter$ = new rx.Subject(0);
  #counterplusplus$ = this.#counter$.pipe(rx.map(el => el + 1));

  render = () => [
    h.div(this.#counter$),
    h.div(this.#counterplusplus$),
    h.button({
      events: {
        click: _ => this.#counter$.next(this.#counter$.value + 1)
      }
    }, 'Inc')
  ]
}
Button.register();
