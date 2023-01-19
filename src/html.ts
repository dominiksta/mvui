import TemplateElement from "./template-element";

const Html = {
  Div: TemplateElement.fromBuiltin("div"),
  H1: TemplateElement.fromBuiltin("h1"),
  H2: TemplateElement.fromBuiltin("h2"),
  H3: TemplateElement.fromBuiltin("h3"),
  H4: TemplateElement.fromBuiltin("h4"),
  H5: TemplateElement.fromBuiltin("h5"),
  P: TemplateElement.fromBuiltin("p"),
  Ul: TemplateElement.fromBuiltin("ul"),
  Li: TemplateElement.fromBuiltin("li"),
  Input: TemplateElement.fromBuiltin("input"),
  Button: TemplateElement.fromBuiltin("button"),
  Span: TemplateElement.fromBuiltin("span"),
  FieldSet: TemplateElement.fromBuiltin("fieldset"),
  Legend: TemplateElement.fromBuiltin("legend"),
  Template: TemplateElement.fromBuiltin("template"),
  Slot: TemplateElement.fromBuiltin("slot"),
}

export default Html;
