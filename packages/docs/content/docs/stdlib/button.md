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
      std.Button.t('Default'),
      std.Button.t({ props: { kind: 'primary' }}, 'Primary'),
      std.Button.t({ props: { kind: 'accent' }}, 'Accent'),
    ];
  }
}
```
{{</codeview>}}

## Description

{{% stdlib-doc file="button.description" %}}

## Reference

{{% stdlib-doc file="button.reference" %}}
