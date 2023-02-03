import { Component, Html, rx } from "@mvui/core";

export default class Button extends Component {
  #counter$ = new rx.Subject(0);
  #counterplusplus$ = this.#counter$.pipe(rx.map(el => el + 1));

  render = () => [
    Html.div(this.#counter$),
    Html.div(this.#counterplusplus$),
    Html.button({
      events: {
        click: _ => this.#counter$.next(this.#counter$.value + 1)
      }
    }, 'Inc')
  ]
}
Button.register();
