---
title: "Web Components"
slug: vanilla_js_web_components
weight: 01
bookToC: false
---

# Vanilla JS Web Components

An Mvui component is fundamentally a standard web component. It is therefore necessary to
understand the basic concepts of web components to use Mvui effectively. If you have
already used web components, you can skip this section.

## What?

An in-depth introduction to web components in general is out of scope for this
documentation, but here is a brief summary:

- Web components are JavaScript classes that extend `HTMLElement`. They can then set
  `this.innerHTML` to render their content, typically after they are added to the DOM.
- In order to add web components to the DOM, one must first register the component to the
  custom elements registry to give it a tag name.
- Web components are usually isolated from one another using the *Shadow DOM*. This means
  that CSS, `querySelector` and other calls are scoped to just the component.
- They often allow setting parameters both via class fields (`myComponent.param = 'value'`
  in JS) and HTML attributes (`<my-component param="value"><my-component/>` in HTML).

{{<codeview>}}
```typescript
export default class MyWebComponent extends HTMLElement {
  connectedCallback() { this.innerHTML = `<b>Hello, World!</b>`; }
}

customElements.define('my-web-component', MyWebComponent);
```
{{</codeview>}}

## Why?

The key advantage of web components is that once written, they can be used in just about
any context:

- Common frontend frameworks like React, Angular, etc. can interact with them by default,
  because they behave like any other HTML element. For example, the
  [ionic](https://ionicframework.com) component library is built using web components and
  then provides wrappers to make the usage in various frameworks more pleasant. This means
  they can reuse most of the core component logic and styling between frameworks.
- Content Management Systems (CMS) may support manual editing of HTML or just putting HTML
  in markdown. Convincing a CMS to use components from say React can be challenging, while
  Web Components are pretty much just work. In fact, the live code sandbox that is used in
  this documentation is an Mvui web component that can be used directly from markdown with
  the Hugo static site generator.

## Why Not?

The browser API for web components is perhaps sufficient for small one-off components, but
it should really be considered a basic building block for frameworks to build on. For
example, there is no concept of reactivity and "templating" is done by just using
strings. In general, most will consider the API not very pleasant to work with in
comparison to modern frontend frameworks.

This is where frameworks like Mvui, [LitElement](https://lit.dev),
[SlimJS](https://slimjs.com/#/welcome) or [Fast
Element](https://www.fast.design/docs/fast-element/defining-elements) come in: They
provide relatively small abstractions to significantly improve experience of working with
web components.
