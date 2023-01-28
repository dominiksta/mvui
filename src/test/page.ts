import Html from "../html";
import Component from "../component"
import { SmartComponent } from "./props";
import { CounterComponent, ReactiveList } from "./reactivity";
import { EventReceiver } from "./events";
import { TemplateReferencesTest1, TemplateReferencesTest2 } from "./template-references";
import { SlotsTest } from "./slots";
import { StyledComponent } from "./styles";
import SomeWebComponentLibraryWrapper from "./web-component-to-mvui";

export class BasicChild extends Component {
  render = () => [
    Html.P('I am a Child Component')
  ];
}
BasicChild.register();

export default class TestPage extends Component {
  render = () => [
    Html.Div([
      Html.H1('Heading'),
      Html.H3({ style: { background: 'red' } }, 'Heading Level 3'),
      BasicChild.new(),
      StyledComponent.new(),
      Html.FieldSet([
        Html.Legend('Web Component Wrappers'),
        SomeWebComponentLibraryWrapper.SomeWebComponent({
          attrs: { attr1: 4 }, fields: { prop1: 5 },
          events: { customEvt1: e => alert(`value: ${e.detail}`) },
        }),
      ]),
      SlotsTest.new(),
      CounterComponent.new(),
      ReactiveList.new(),
      Html.P('Here is some text in a paragraph'),
      Html.Input({ attrs: { type: "number", value: "4" }, fields: { alt: "hi" } }),
      SmartComponent.new(),
      EventReceiver.new(),
      TemplateReferencesTest1.new({ events: {
        // error: e => { console.log(e); e.preventDefault() }
      }}),
      TemplateReferencesTest2.new(),
    ])
  ];
}
TestPage.register();