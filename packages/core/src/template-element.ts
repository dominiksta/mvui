import { MvuiCSSSheet } from "./style";
import { isSubscribable } from "./rx/subscribable";
import { MaybeSubscribable } from "./util/types";

type ToStringable = { toString: () => string };

export interface EventWithTarget<T extends HTMLElement> extends Event {
  target: T;
}

type GlobalEventHandlersEventMapWithTarget<T extends HTMLElement> =
  Omit<GlobalEventHandlersEventMap, "change"> & { change: EventWithTarget<T> };

export type TemplateElementCreator<
  T extends HTMLElement,
  Params extends ParamSpec = {},
  Props extends { [key: string]: any } = T,
> = (
  childrenOrParams?: TemplateElementChildren |
    TemplateElementParams<T, Params, Props>,
  children?: TemplateElementChildren,
) => TemplateElement<T, Params, Props>;

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
      || isSubscribable(childrenOrParams)
      || childrenOrParams instanceof TemplateElement
      || childrenOrParams instanceof HTMLElement
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
    Params extends ParamSpec = {},
  >(
    creator: () => T,
  ): TemplateElementCreator<T, Params, never>;

  static fromCustom<
    T extends HTMLElement,
    Params extends ParamSpec = {},
  >(
    creator: { new (): T },
  ): TemplateElementCreator<T, Params, never>;

  static fromCustom<T extends keyof HTMLElementTagNameMap>(tagName: T):
    TemplateElementCreator<HTMLElementTagNameMap[T], {}, never>;

  static fromCustom<
    T extends HTMLElement = HTMLElement,
    Params extends ParamSpec = any,
  >(tagName: string): TemplateElementCreator<any, Params, never>;

  static fromCustom(
    tagNameOrCreator: string | (() => HTMLElement) | { new (): HTMLElement }
  ): TemplateElementCreator<any, any, any> {

    let creator: () => HTMLElement;
    if (typeof tagNameOrCreator === 'string') {
      creator = () => document.createElement(tagNameOrCreator);
    } else if (
      'prototype' in tagNameOrCreator
      && tagNameOrCreator.prototype instanceof HTMLElement
    ) {
      // console.debug(tagNameOrCreator);
      creator = () => new (tagNameOrCreator as any)();
    } else {
      creator = tagNameOrCreator as any;
    }

    return function(
      childrenOrParams?: TemplateElementChildren |
        TemplateElementParams<any, any, any>,
      children?: TemplateElementChildren,
    ) {
      return new TemplateElement<any, any, any>(
        creator, childrenOrParams, children
      );
    }
  }
}

export type TemplateElementChild<T extends HTMLElement = any> =
  (T extends HTMLElement ? never : ToStringable) |
  TemplateElement<T, any, any> |
  HTMLElement |
  undefined;

export type TemplateElementChildren<T extends HTMLElement = any> =
  MaybeSubscribable<TemplateElementChild<T> | (TemplateElementChild<T>)[]>;

export type ParamSpec = {
  events?: { [key: string]: any },
  slots?: { [key: string]: HTMLElement },
  // by default, an elements custom attributes will mirror its properties. this is the
  // default behaviour of both builtin htmlelements and mvui components
  attributes?: { [key: string]: any },
};

export type TemplateElementParams<
  T extends HTMLElement,
  Params extends ParamSpec = {},
  Props extends { [key: string]: any } = {}
> = {
  style?: Partial<{ [key in keyof CSSStyleDeclaration]: MaybeSubscribable<ToStringable> }>,
  styleOverrides?: MvuiCSSSheet,

  classes?: { [key: string]: MaybeSubscribable<boolean> },

  attrs?: Partial<{
    [Property in keyof Params['attributes']]:
    MaybeSubscribable<Params['attributes'][Property]> | MaybeSubscribable<ToStringable>
  } & { class: MaybeSubscribable<ToStringable> } &
  { [key: string]: MaybeSubscribable<ToStringable> }>,

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
    [Property in keyof T]: MaybeSubscribable<T[Property]>
  }>,

  // Props are always optional for a technical reason: A webcomponent may be
  // instantiated from a call to document.createElement, which does not have the ability
  // to pass anything to the constructor. Therefore, any webcomponent must have some
  // valid initial state and props must always be optional.
  props?: Partial<{
    [Property in keyof Props]:
    MaybeSubscribable<Props[Property]>
  }>

  ref?: { current: HTMLElement },
};
