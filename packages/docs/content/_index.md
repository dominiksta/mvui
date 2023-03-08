---
title: ""
date: 2023-03-05T22:27:45+01:00
---

# Mvui - A Minimalist Webcomponent Framework

*"Minimum Viable UI"*

Yes, this is a new frontend framework, and no, that is not a joke.

```typescript
import { Component, rx, h } from "@mvui/core";

export class CounterComponent extends Component {
  render() {
    return [
      const count = new rx.State(0);
      h.p([
        h.button({ events: {
          click: _ => count.next(c => c + 1)
        }}, 'Increment'),
        h.span(count.derive(v => `count: ${v}`))
      ])
    ];
  }
}
```

### Links

- [Getting Started](/tutorial/getting-started)
- [API Reference](/reference/modules)
<!-- - [Standard Library](/stdlib) -->
