---
title: ""
---

# Button

## Example

{{<codeview>}}
```typescript
import { Component, rx } from "@mvui/core";
import * as std from "@mvui/stdlib";

export default class Example extends Component {
  render() {
    return [
      std.button('Default'),
      std.button({ props: { kind: 'primary' }}, 'Primary'),
      std.button({ props: { kind: 'accent' }}, 'Accent'),
    ];
  }
}
```
{{</codeview>}}

## Description

{{% stdlib-doc file="button.description" %}}

## Reference

{{% stdlib-doc file="button.reference" %}}
