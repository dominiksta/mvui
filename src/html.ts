import TemplateElement from "./template-element";

const Html = {
  Div: TemplateElement.getGeneratorFunction("div"),
  H1: TemplateElement.getGeneratorFunction("h1"),
  H2: TemplateElement.getGeneratorFunction("h2"),
  H3: TemplateElement.getGeneratorFunction("h3"),
  H4: TemplateElement.getGeneratorFunction("h4"),
  H5: TemplateElement.getGeneratorFunction("h5"),
  P: TemplateElement.getGeneratorFunction("p"),
  Ul: TemplateElement.getGeneratorFunction("ul"),
  Li: TemplateElement.getGeneratorFunction("li"),
  Input: TemplateElement.getGeneratorFunction("input"),
  Button: TemplateElement.getGeneratorFunction("button"),
  Span: TemplateElement.getGeneratorFunction("span"),
  FieldSet: TemplateElement.getGeneratorFunction("fieldset"),
  Legend: TemplateElement.getGeneratorFunction("legend"),
}

export default Html;
