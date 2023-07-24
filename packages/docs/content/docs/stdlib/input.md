---
title: ""
---

# Input

## Example

{{<codeview output-height="100px">}}
import { Component, rx, h } from "@mvui/core";
import * as std from "@mvui/stdlib";

export default class Example extends Component {
  render() {
    const value = new rx.State('hi');
    return [
      std.Input.t({props: { value: rx.bind(value) }}),
      std.Input.t({props: { value: rx.bind(value) }}),
      h.span(value),
    ];
  }
}
{{</codeview>}}

## Description

{{% stdlib-doc file="input.description" %}}

## Reference

{{% stdlib-doc file="input.reference" %}}
