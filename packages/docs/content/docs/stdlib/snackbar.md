---
title: ""
---

# Snackbar

## Example

{{<codeview output-height="100px">}}
import { Component, rx, h } from "@mvui/core";
import * as std from "@mvui/stdlib";

export default class Example extends Component {
  render() {
    return [
      std.Snackbar.t(), // can be anywhere
      std.Button.t(
        { events: { click: _ => std.openSnackbar('hi') }},
        'Trigger Snackbar'
      )
    ];
  }
}
{{</codeview>}}

<app-snackbar-test><app-snackbar-test/>


## Description

{{% stdlib-doc file="snackbar.description" %}}
