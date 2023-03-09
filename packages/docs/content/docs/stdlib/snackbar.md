---
title: ""
---

# Snackbar

## Example

<script type="module">
import * as std from "@mvui/stdlib";
import { Component, h } from "@mvui/core";

const snackbar = new std.Snackbar();
document.body.appendChild(snackbar);

class SnackbarTest extends Component {
  render() {
    return [
      std.button(
        { events: { click: _ => std.openSnackbar('hi') }},
        'Trigger Snackbar'
      )
    ];
  }
}
SnackbarTest.register();
</script>

<app-snackbar-test><app-snackbar-test/>


## Description

{{% stdlib-doc file="snackbar.description" %}}
