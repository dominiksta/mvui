import State from "./state";

/**
 * This class is technically nothing but a {@link State}, but if you use it in
 * a template it signals to mvui that you want a two-way binding. Currently, this only
 * works for mvui internal props. It is intended to expand two-way bindings to public
 * class fields of html builtins and wrapped components soon.
 *
 * @example
 * ```typescript
 * class MyBoundInput extends Component {
 *   props = { value: new Prop('') };
 * 
 *   render = () => [
 *     h.input({ fields: { ...this.props }, events: {
 *       change: e => this.props.value.next(e.target.value) 
 *     }})
 *   ]
 * }
 * 
 * class BindingTest extends Component {
 *   #state = new rx.Binding('initial');
 * 
 *   render = () => [
 *     MyBoundInput.new({ props: { value: this.#state }}),
 *     MyBoundInput.new({ props: { value: this.#state }}),
 *     h.div(this.#state),
 *     h.button({ events: { click: _ => this.#state.next('intial') }}, 'reset')
 *   ]
 * }
 * ```
 */
export default class Binding<T> extends State<T> { }
