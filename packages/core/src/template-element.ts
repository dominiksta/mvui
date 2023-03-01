import { MvuiCSSSheet } from "style";
import { Stream } from "./rx";

type ToStringable = { toString: () => string };
type MaybeStream<T> = Stream<T> | T;

export interface EventWithTarget<T extends HTMLElement> extends Event {
  target: T;
}

type GlobalEventHandlersEventMapWithTarget<T extends HTMLElement> =
  Omit<GlobalEventHandlersEventMap, "change"> & { change: EventWithTarget<T> };

/**
 * TODO
 */
export default class TemplateElement<
  T extends HTMLElement,
  Events extends { [key: string]: any } = {},
  // by default, an elements custom attributes will mirror its properties. this is the
  // default behaviour of both builtin htmlelements and mvui components
  Attributes extends { [key: string]: any } = T,
  Props extends { [key: string]: any } = {},
> {

  public params: TemplateElementParams<T, Events, Attributes, Props> = {}
  public children: TemplateElementChildren = []


  constructor(
    public creator: () => T,
    childrenOrParams?: TemplateElementChildren | TemplateElement<T>['params'],
    children?: TemplateElementChildren,
  ) {
    if (
      typeof childrenOrParams === 'string'
      || childrenOrParams instanceof Array
      || childrenOrParams instanceof Stream
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
    Events extends { [key: string]: any } = {},
    Attributes extends { [key: string]: any } = T,
  >(
    creator: () => T,
  ) {
    type El = TemplateElement<T, Events, Attributes>;
    return function(
      childrenOrParams?: TemplateElementChildren |
        TemplateElementParams<T, Events, Attributes>,
      children?: TemplateElementChildren,
    ) {
      return new TemplateElement<any, any, any>(
        creator, childrenOrParams, children
      ) as El;
    }
  }

  static fromBuiltin<T extends keyof HTMLElementTagNameMap>(tagName: T) {
    return function(
      childrenOrParams?: TemplateElementChildren |
        TemplateElementParams<HTMLElementTagNameMap[T]>,
      children?: TemplateElementChildren,
    ) {
      return new TemplateElement<HTMLElementTagNameMap[T]>(
        () => document.createElement(tagName), childrenOrParams, children
      )
    }
  }
}

export type TemplateElementChildren =
  string | Stream<any> | TemplateElement<any, any, any, any> |
  (TemplateElement<any, any, any, any> | string)[];

export type TemplateElementParams<
  T extends HTMLElement,
  EventsT extends { [key: string]: any } = {},
  Attributes extends { [key: string]: any } = T,
  Props extends { [key: string]: any } = {}
  > = {
    style?: Partial<CSSStyleDeclaration>,
    styleOverrides?: MvuiCSSSheet,

    attrs?: Partial<{
      [Property in keyof Attributes]:
      MaybeStream<Attributes[Property]> | MaybeStream<ToStringable>
    } & { class: MaybeStream<ToStringable> } &
    { [key: string]: MaybeStream<ToStringable> }>,

    events?: Partial<{
      [Property in Exclude<
        keyof GlobalEventHandlersEventMapWithTarget<T>, keyof EventsT
      >]:
      (event: GlobalEventHandlersEventMapWithTarget<T>[Property]) => any
    } & {
        [Property in keyof EventsT]:
        (event: CustomEvent<EventsT[Property]>) => any
      }>,
    fields?: Partial<{
      [Property in keyof T]: MaybeStream<T[Property]>
    }>,

    // Props are always optional for a technical reason: A webcomponent may be
    // instantiated from a call to document.createElement, which does not have the ability
    // to pass anything to the constructor. Therefore, any webcomponent must have some
    // valid initial state and props must always be optional.
    props?: Partial<{
      [Property in keyof Props]:
      MaybeStream<Props[Property]>
    }>
  };
