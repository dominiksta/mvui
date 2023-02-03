import { Component, Html } from "@mvui/core";

export default class Button extends Component {
  render = () => [
    Html.button('Hello World')
  ]
}
Button.register();
