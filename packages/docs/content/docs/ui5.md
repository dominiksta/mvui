---
title: "UI5"
weight: 100
---

# UI5

The mvui team endeavours to provide enterprise ready solutions, empowering developers with
a state-of-the-art framework to facilitate rapid iteration. Our continuing mission is and
has always been to help businesses navigate the complex space of modern technology like
Artificial Intelligence (AI) and Blockchain more effectively with standardized tooling. We
are therefore excited to announce our integration of [SAP UI5 Web
Components](https://sap.github.io/ui5-webcomponents/)!

Jokes aside, the UI5 Web Components are actually a very practical and complete component
library. They will also probably stick around for a long time because SAP is advertising
them to enterprise customers, which usually expect stability and long term support.

Are they the prettiest components in the world? Arguably no. But they fit the intended use
case of mvui very well: Projects that are specifically built to require minimal long term
maintenance. They are also much more feature complete than most component libraries: They
have dark mode support, high contrast themes for accesibility, right-to-left language
support, many responsive components (like a menu that looks like a right-click menu on
desktop but becomes a full-screen component on mobile) and a selection of complex
components like wizards, calendars that support different calendar types or trees with
custom nested components.

Fundamentally, there is nothing stopping you from using any web component library in
mvui. To provide type-safety for events and slots however, creating wrappers is
necessary. Because of this, mvui provides wrappers to all UI5 Web Components in the
`@mvui/ui5` package. You can read about available components, their arguments, events,
etc. in the [official documentation](https://sap.github.io/ui5-webcomponents/components/).

```typescript
import { Component, h } from '@mvui/core';
import * as ui5 from '@mvui/ui5';

export default class UI5Test extends Component {
  render() {
    return [
      ui5.button('Hi'),
    ]
  }
}
```
