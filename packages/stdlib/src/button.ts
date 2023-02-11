import { Component, h, rx, style } from "@mvui/core";

/**
 * This is a really cool button.
 *
 * @example
 * ```typescript
 * class Example extends Component {
 *   render = () => [
 *     Button.new('Click Me!'),
 *   ]
 * }
```
 */
export default class Button extends Component {
  static styles = [
    ...style.sheet({
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

  props = {
    /** where does this go? */
    text: new rx.Prop(''),
  }

  #counter$ = new rx.State(0);
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
