---
title: "UI5"
weight: 103
bookToC: false
---

# SAP UI5 Web Components Integration

## Why

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
`@mvuijs/ui5` package. Also, the package bundles the required fonts so that you can use
the package for offline applications (with something like electron). You can read about
available components, their arguments, events, etc. in the [official
documentation](https://sap.github.io/ui5-webcomponents/components/).

## How

First, install the package with `npm install @mvuijs/ui5`. All Components are available as
single import (e.g. `import { input } from '@mvuijs/ui5')`, but you may import them all
with a `*` import for convenience (`import * as ui5 from '@mvuijs/ui5'`),

Below is a simple example of the UI5 input and
[DateTimePicker](https://sap.github.io/ui5-webcomponents/components/DateTimePicker/),
showing the use of two-way bindings for the date. Two-way bindings work because Mvui
listens to `change` events when using two-way bindings by default.

{{<codeview output-height="600px">}}
```typescript
import { Component, h, rx } from '@mvuijs/core';
import * as ui5 from '@mvuijs/ui5';

const INITIAL_DATE = '2024-01-01 01:02:03';

@Component.register
export default class UI5Test extends Component {
  render() {
    const date = new rx.State(INITIAL_DATE);

    return [
      // in production, you should really validate the dates string format. this
      // is more for demonstrational purposes
      ui5.input({ fields: { value: rx.bind(date) }}),
      ui5.dateTimePicker({ fields: {
        value: rx.bind(date),
        formatPattern: 'YYYY-MM-dd hh:mm:ss'
      }}),
      ui5.button({ events: { click: _ => date.next(INITIAL_DATE) } }, 'Reset'),
    ]
  }
}
```
{{</codeview>}}
