import TemplateElement from "./template-element";

const Html = {
  Div: TemplateElement.getGeneratorFunction("div"),
  H1: TemplateElement.getGeneratorFunction("h1"),
  H2: TemplateElement.getGeneratorFunction("h2"),
  H3: TemplateElement.getGeneratorFunction("h3"),
  P: TemplateElement.getGeneratorFunction("p"),
  Input: TemplateElement.getGeneratorFunction("input"),
}

export default Html;
