---
title: ""
---

# Menu

## Example

{{<codeview output-height="150px">}}
import { Component, rx } from "@mvui/core";
import * as std from "@mvui/stdlib";

export default class Example extends Component {
  render() {
    return [
      std.menu([
        std.menuitem('Menu 1 Item 1'),
        std.menuitem('Menu 1 Item 2'),
        std.menu({ props: { text: 'Submenu 1' }}, [
          std.menuitem('Submenu 1 Item 1'),
          std.menuitem('Submenu 1 Item 2'),
          std.menu({ props: { text: 'SubSubmenu 1' } }, [
            std.menuitem('SubSubmenu 1 Item 1'),
            std.menuitem('SubSubmenu 1 Item 2'),
          ]),
        ]),
        std.menuitem('Menu 1 Item 3'),
      ]),
    ];
  }
}
{{</codeview>}}

## Description

{{% stdlib-doc file="menu/menu.description" %}}

## Reference: Menu

{{% stdlib-doc file="menu/menu.reference" %}}

## Reference: MenuItem

{{% stdlib-doc file="menu/menu-item.reference" %}}
