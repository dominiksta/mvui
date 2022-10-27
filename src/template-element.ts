import { applyCSSStyleDeclaration } from "./util/css";
import { camelToDash } from "./util/strings";

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
  public children: string | TemplateElement<any> | TemplateElement<any>[] = []


  constructor(
    public tagName: keyof HTMLElementTagNameMap,
    childrenOrProps?: TemplateElement<T>['children'] | TemplateElement<T>['props'],
    children?: TemplateElement<T>['children'],
  ) {
    if (childrenOrProps instanceof Array || typeof childrenOrProps === 'string') {
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
        tagName, childrenOrProps, children
      )
    }
  }


  render() {
    const thisEl = document.createElement(this.tagName) as T;

    // --- setup attributes, properties, events
    if (this.props) {
      if (this.props.attrs) {
        for (let attr in this.props.attrs) {
          // TODO: if (this.props.attrs[attr] instanceof Observable)
          thisEl.setAttribute(camelToDash(attr), this.props.attrs[attr] as string);
        }
      }
      if (this.props.instance) {
        for (let prop in this.props.instance) {
          (thisEl as any)[prop] = this.props.instance[prop];
        }
      }
      if (this.props.style) applyCSSStyleDeclaration(thisEl, this.props.style);
    }

    // --- recurse
    if (this.children) {
      if (typeof this.children === 'string') {
        thisEl.innerText = this.children;
      } else if (this.children instanceof TemplateElement) {
        thisEl.appendChild(this.children.render());
      } else if (this.children instanceof Array) {
        for (let child of this.children) {
          thisEl.appendChild(child.render());
        }
      }
    }

    return thisEl;
  }
}
