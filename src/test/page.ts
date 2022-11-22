import Html from "../html";
import Component from "../component"
import { SmartComponent } from "./props";
import { CounterComponent, ReactiveList } from "./reactivity";
import { EventReceiver } from "./events";
import { TemplateReferencesTest1, TemplateReferencesTest2 } from "./template-references";

export class BasicChild extends Component {
  render = () => [
    Html.P('I am a Child Component')
  ];
}
customElements.define('mvui-test-basic-child', BasicChild);

export default class TestPage extends Component {
  render = () => [
    Html.Div([
      Html.H1('Heading'),
      Html.H3({ style: { background: 'red' } }, 'Heading Level 3'),
      BasicChild.new(),
      CounterComponent.new(),
      ReactiveList.new(),
      Html.P('Here is some text in a paragraph'),
      Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" } }),
      SmartComponent.new(),
      EventReceiver.new(),
      TemplateReferencesTest1.new(),
      TemplateReferencesTest2.new(),
    ])
  ];
}
customElements.define('mvui-test-page', TestPage);
