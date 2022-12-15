import Component from "../component";
import Html from "../html";

class MyLayout extends Component {
  render = () => [
    Html.Div('"Header"'),
    Html.Div(Html.Slot()),
    Html.Div('"Footer"'),
    Html.Slot({ attrs: { name: "after-footer" } }),
  ]
}
MyLayout.register();

export class SlotsTest extends Component {
  render = () => [
    Html.FieldSet([
      Html.Legend('Slots'),
      MyLayout.new([
        Html.Div('Content Children'),
        Html.Div('Content Children 2'),
        Html.Div({ attrs: { slot: "after-footer" } }, 'After Footer'),
      ])
    ])
  ]
}
SlotsTest.register();
