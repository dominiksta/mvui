import { Observable } from "./observables";

type ToStringable = { toString: () => string };
type MaybeObservable<T> = Observable<T> | T;

export default class TemplateElement<
  T extends HTMLElement,
  // in theory it would be slightly more robust if we would define all
  // attributes and properties by hand, but this is a reasonable enough
  // approximation
  AttrT = Partial<{
    [Property in keyof T]: MaybeObservable<T[Property]> | MaybeObservable<ToStringable>
  }>,
  InstanceT = Partial<{
    [Property in keyof T]: MaybeObservable<T[Property]>
  }>
> {

  public props: {
    style?: Partial<CSSStyleDeclaration>,
    attrs?: AttrT,
    events?: Partial<GlobalEventHandlers>,
    instance?: InstanceT,
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
