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
      std.Menu.t([
        std.MenuItem.t('Menu 1 Item 1'),
        std.MenuItem.t('Menu 1 Item 2'),
        std.Menu.t({ props: { text: 'Submenu 1' }}, [
          std.MenuItem.t('Submenu 1 Item 1'),
          std.MenuItem.t('Submenu 1 Item 2'),
          std.Menu.t({ props: { text: 'SubSubmenu 1' } }, [
            std.MenuItem.t('SubSubmenu 1 Item 1'),
            std.MenuItem.t('SubSubmenu 1 Item 2'),
          ]),
        ]),
        std.MenuItem.t('Menu 1 Item 3'),
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
