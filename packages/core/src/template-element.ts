import { MvuiCSSSheet } from "./style";
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
export class TemplateElement<
  T extends HTMLElement,
  Params extends ParamSpec = { },
  // props are not part of the param spec because they are infered while the paramspec has
  // to be provided by the user
  Props extends { [key: string]: any } = { },
> {

  public params: TemplateElementParams<T, Params, Props> = {}
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
    Params extends {
      events?: { [key: string]: any },
      slots?: { [key: string]: HTMLElement },
    } = {},
    Attributes extends { [key: string]: any } = T,
  >(
    creator: () => T,
  ) {
    type El = TemplateElement<T, Params, Attributes>;
    return function(
      childrenOrParams?: TemplateElementChildren |
        TemplateElementParams<T, Params, Attributes>,
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

export type TemplateElementChild<T extends HTMLElement = any> =
  (T extends HTMLElement ? never : ToStringable) |
  TemplateElement<T, any, any> |
  undefined;

export type TemplateElementChildren<T extends HTMLElement = any> =
  MaybeStream<TemplateElementChild<T> | (TemplateElementChild<T>)[]>;

export type ParamSpec = {
  events?: { [key: string]: any },
  slots?: { [key: string]: HTMLElement },
  // by default, an elements custom attributes will mirror its properties. this is the
  // default behaviour of both builtin htmlelements and mvui components
  attributes?: { [key: string]: any },
};

export type TemplateElementParams<
  T extends HTMLElement,
  Params extends ParamSpec = { },
  Props extends { [key: string]: any } = {}
  > = {
    style?: Partial<{[key in keyof CSSStyleDeclaration]: MaybeStream<ToStringable>}>,
    styleOverrides?: MvuiCSSSheet,

    classes?: {[key: string]: MaybeStream<boolean>},

    attrs?: Partial<{
      [Property in keyof Params['attributes']]:
      MaybeStream<Params['attributes'][Property]> | MaybeStream<ToStringable>
    } & { class: MaybeStream<ToStringable> } &
    { [key: string]: MaybeStream<ToStringable> }>,

    events?: Partial<{
      [Property in Exclude<
        keyof GlobalEventHandlersEventMapWithTarget<T>, keyof Params['events']
      >]:
      (event: GlobalEventHandlersEventMapWithTarget<T>[Property]) => any
    } & {
        [Property in keyof Params['events']]:
        (event: Params['events'][Property]) => any
      }>,

    slots?: Partial<{
      [Property in keyof Params['slots']]: TemplateElementChildren<
        Params['slots'] extends {} ? Params['slots'][Property] : any
      >
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
