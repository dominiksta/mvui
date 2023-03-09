---
title: ""
---

# Menu

## Example

<script type="module">
import { Menu, MenuItem } from "@mvui/stdlib";
console.log(Menu, MenuItem);
</script>

<std-menu>
  <std-menu-item> Menu Item 1 </std-menu-item>
  <std-menu text="Submenu"> 
    <std-menu-item> Submenu Item 1 </std-menu-item>
    <std-menu-item> Submenu Item 2 </std-menu-item>
  </std-menu>
  <std-menu-item> Menu Item 2 </std-menu-item>
</std-menu>

## Description

{{% stdlib-doc file="menu/menu.description" %}}

## Reference: Menu

{{% stdlib-doc file="menu/menu.reference" %}}

## Reference: MenuItem

{{% stdlib-doc file="menu/menu-item.reference" %}}
