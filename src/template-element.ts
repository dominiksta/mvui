import { Observable } from "./observables";

// interface TemplateProps<AttrT, InstanceT> {
//   style?: Partial<CSSStyleDeclaration>,
//   attrs?: AttrT,
//   instance?: InstanceT,
//   // TODO events:
// }
// 
export default class TemplateElement<T extends HTMLElement> {

  public props: {
    style?: Partial<CSSStyleDeclaration>,
    // in theory it would be slightly more robust if we would define all
    // attributes and properties by hand, but this is a reasonable enough
    // approximation
    attrs?: Partial<T>,
    instance?: Partial<T>,
    // TODO events:
  } = {}
  public children: string | Observable<any> |
    TemplateElement<any> | TemplateElement<any>[] = []


  constructor(
    public creator: () => T,
    childrenOrProps?: TemplateElement<T>['children'] | TemplateElement<T>['props'],
    children?: TemplateElement<T>['children'],
  ) {
    if (
      childrenOrProps instanceof Array || typeof childrenOrProps === 'string'
      || childrenOrProps instanceof Observable
    ) {
      if (children) throw new Error('Invalid arguments');
      this.children = childrenOrProps as any;
    } else {
      this.props = childrenOrProps as any;
      this.children = children || [];
    }
  }

  static getGeneratorFunction<T extends keyof HTMLElementTagNameMap>(
    tagName: T
  ) {
    return function(
      childrenOrProps?: TemplateElement<HTMLElementTagNameMap[T]>['children'] |
        TemplateElement<HTMLElementTagNameMap[T]>['props'],
      children?: TemplateElement<HTMLElementTagNameMap[T]>['children'],
    ) {
      return new TemplateElement<HTMLElementTagNameMap[T]>(
        () => document.createElement(tagName), childrenOrProps, children
      )
    }
  }
}
