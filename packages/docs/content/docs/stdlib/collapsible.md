---
title: ""
---

# Collapsible

## Example

{{<codeview output-height="100px">}}
import { Component, rx, h } from "@mvui/core";
import * as std from "@mvui/stdlib";

export default class Example extends Component {
  render() {
    return [
      std.collapsible({
        slots: { header: h.span('Header') },
      }, 'Content'),
    ];
  }
}
{{</codeview>}}

## Description

{{% stdlib-doc file="collapsible.description" %}}

## Reference

{{% stdlib-doc file="collapsible.reference" %}}
