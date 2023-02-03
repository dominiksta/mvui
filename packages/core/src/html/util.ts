import TemplateElement from "template-element"

export type HtmlTemplateElChildrenOrParams<T extends keyof HTMLElementTagNameMap> =
  TemplateElement<HTMLElementTagNameMap[T]>['children'] |
  TemplateElement<HTMLElementTagNameMap[T]>['params']

export function genHtmlTemplateEl<T extends keyof HTMLElementTagNameMap>(tagName: T) {
    return function(
      childrenOrParams?: HtmlTemplateElChildrenOrParams<T>,
      children?: TemplateElement<HTMLElementTagNameMap[T]>['children'],
    ) {
      return new TemplateElement<HTMLElementTagNameMap[T]>(
        () => document.createElement(tagName), childrenOrParams, children
      )
    }
}
