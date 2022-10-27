import Html from "./html"

const testEl = Html.Div([
  Html.H1('Heading'),
  Html.H3({ style: { background: 'red' } }, 'Heading Level 3'),
  Html.P('Here is some text in a paragraph'),
  Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" }})
]).render()

document.body.appendChild(testEl);

