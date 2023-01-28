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
  // by default, an elements custom attributes will mirror its properties. this is the
  // default behaviour of both builtin htmlelements and mvui components
  CustomAttributesMap extends { [key: string]: any } = T,
  CustomPropsMap extends { [key: string]: any } = {},
> {

  public props: {
    style?: Partial<CSSStyleDeclaration>,

    attrs?: Partial<{
      [Property in keyof CustomAttributesMap]:
      MaybeObservable<CustomAttributesMap[Property]> | MaybeObservable<ToStringable>
    } & { class: MaybeObservable<ToStringable> } &
    { [key: string]: MaybeObservable<ToStringable> }>,

    events?: Partial<{
      [Property in keyof GlobalEventHandlersEventMapWithTarget<T>]:
      (event: GlobalEventHandlersEventMapWithTarget<T>[Property]) => any
    } & {
      [Property in keyof CustomEventsMap]:
      (event: CustomEvent<CustomEventsMap[Property]>) => any
    }>,
    fields?: Partial<{
      [Property in keyof T]: MaybeObservable<T[Property]>
    }>,

    // Props are always optional for a technical reason: A webcomponent may be
    // instantiated from a call to document.createElement, which does not have the ability
    // to pass anything to the constructor. Therefore, any webcomponent must have some
    // valid initial state and props must always be optional.
  } & Partial<{
    [Property in keyof CustomPropsMap]:
    MaybeObservable<CustomPropsMap[Property]>
  }> = {}
  public children: string | Observable<any> |
    TemplateElement<any> | TemplateElement<any>[] = []


  constructor(
    public creator: () => T,
    childrenOrProps?: TemplateElement<T>['children'] | TemplateElement<T>['props'],
    children?: TemplateElement<T>['children'],
  ) {
    if (
      typeof childrenOrProps === 'string'
      || childrenOrProps instanceof Array
      || childrenOrProps instanceof Observable
      || childrenOrProps instanceof TemplateElement
    ) {
      if (children) throw new Error('Invalid arguments');
      this.children = childrenOrProps as any;
    } else {
      this.props = childrenOrProps as any;
      this.children = children || [];
    }
  }

  static fromCustom<
    T extends HTMLElement,
    CustomEventsMap extends { [key: string]: any } = {},
    CustomAttributesMap extends { [key: string]: any } = T,
  >(
    creator: () => T,
  ) {
    type El = TemplateElement<T, CustomEventsMap, CustomAttributesMap>;
    return function(
      childrenOrProps?: El['children'] |
        El['props'],
      children?: El['children'],
    ) {
      return new TemplateElement<any, any, any>(
        creator, childrenOrProps, children
      ) as El;
    }
  }

  static fromBuiltin<T extends keyof HTMLElementTagNameMap>(
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
