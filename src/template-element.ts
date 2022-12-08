import { Observable } from "./observables";

type ToStringable = { toString: () => string };
type MaybeObservable<T> = Observable<T> | T;

interface EventWithTarget<T extends HTMLElement> extends Event {
  target: T;
}

type GlobalEventHandlersEventMapWithTarget<T extends HTMLElement> =
  Omit<GlobalEventHandlersEventMap, "change"> & { change: EventWithTarget<T> };

export default class TemplateElement<
  T extends HTMLElement,
  CustomEventsMap extends { [key: string]: any } = {},
  // in theory it would be slightly more robust if we would define all
  // attributes and properties by hand, but this is a reasonable enough
  // approximation
  // TODO: custom attributes & maybe 'data-key' by default?
  AttrT = Partial<{
    [Property in keyof T]: MaybeObservable<T[Property]> | MaybeObservable<ToStringable>
  } & { class: MaybeObservable<ToStringable> }>,
> {

  public props: {
    style?: Partial<CSSStyleDeclaration>,
    attrs?: AttrT,
    events?: Partial<{
      [Property in keyof GlobalEventHandlersEventMapWithTarget<T>]:
      (event: GlobalEventHandlersEventMapWithTarget<T>[Property]) => any
    } & {
      [Property in keyof CustomEventsMap]:
      (event: CustomEvent<CustomEventsMap[Property]>) => any
    }>,
    instance?: Partial<{
      [Property in keyof T]: MaybeObservable<T[Property]>
    }>,
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
