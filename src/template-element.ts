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

  public params: {
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
    childrenOrParams?: TemplateElement<T>['children'] | TemplateElement<T>['params'],
    children?: TemplateElement<T>['children'],
  ) {
    if (
      typeof childrenOrParams === 'string'
      || childrenOrParams instanceof Array
      || childrenOrParams instanceof Observable
      || childrenOrParams instanceof TemplateElement
    ) {
      if (children) throw new Error('Invalid arguments');
      this.children = childrenOrParams as any;
    } else {
      this.params = childrenOrParams as any;
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
      childrenOrParams?: El['children'] |
        El['params'],
      children?: El['children'],
    ) {
      return new TemplateElement<any, any, any>(
        creator, childrenOrParams, children
      ) as El;
    }
  }

  static fromBuiltin<T extends keyof HTMLElementTagNameMap>(
    tagName: T
  ) {
    return function(
      childrenOrParams?: TemplateElement<HTMLElementTagNameMap[T]>['children'] |
        TemplateElement<HTMLElementTagNameMap[T]>['params'],
      children?: TemplateElement<HTMLElementTagNameMap[T]>['children'],
    ) {
      return new TemplateElement<HTMLElementTagNameMap[T]>(
        () => document.createElement(tagName), childrenOrParams, children
      )
    }
  }
}
