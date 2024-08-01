---
title: "Home"
date: 2023-03-05T22:27:45+01:00
bookToC: false
---
<img src="/mvui/icon.svg"  width="128" height="128" style="vertical-align: middle">
<div style="display: inline-block; vertical-align: middle">
  <span style="font-size: 250%; font-family: Ubuntu Mono; margin: 0px 10px">Mvui</span>
  <i style="font-size: 130%">"Minimum Viable UI"</i>
</div>

{{<codeview>}}
```typescript
import { Component, rx, h } from "@mvuijs/core";

@Component.register
export default class CounterComponent extends Component {
  render() {
    const count = new rx.State(0);
    return [
      h.button(
        { events: { click: () => count.next(v => v + 1) } },
        'Click Me'
      ),
      h.span(count.derive(v => ` Count: ${v}`)),
    ];
  }
}
```
{{</codeview>}}

<p style="text-align: center">
<a class="get-started-btn" href="/mvui/docs/getting-started">
=> Get Started
</a>

<a style="background: #333333" class="get-started-btn" href="/mvui/reference/modules/">
=> API Reference
</a>
</p>

## Dear God Why Yet Another Frontend Framework?

{{<columns>}}
## It's Tiny

Mvui is around 3000 lines of well documented and tested code with *no dependencies*. You
could probably maintain it yourself if you had to.

<--->
## Web Components

You can mix and match Mvui with other frameworks as you see fit. Even though obviously you
would never want to use anything but Mvui ;)

{{</columns>}}

{{<columns>}}
## Fully Typesafe

Have typescript yell at you in the templates - not just for
[props](docs/components/props-and-attributes/), but also for
[events](docs/components/events/) and [slots](docs/components/slots/) in your templates!

<--->
## Fine-Grained Reactivity

State is managed with a combination of [Redux-like
selectors](docs/reactivity/synchronous/#deriving-state) for synchronous reactivity and
[RxJS-like operators](docs/reactivity/asynchronous/#operators) for asynchronous
reactivity.

{{</columns>}}

{{<columns>}}
## Its JS all the way down

Templates and [CSS](docs/components/styling/) is defined using a simple javascript
syntax. No special editor plugins needed for indentation, syntax-highlighting or
auto-completion.

<--->
## (Don't fear the class)

Actually, Mvui is mostly functional in its aproach. But you *can* do more traditional
object orientation if you so desire.

{{</columns>}}

## Why you shouldn't use Mvui

- The idea is that Mvui should be **built for medium size web apps**. Actually large
  applications probably need code structuring solutions and tooling that would far exceed
  the capabilities of anything that has "minimal" in its name.

- There is no support for Server-Side-Rendering (**SSR**). You can use Mvui components in any
  CMS you want because they are just web components, but you can not pre-render components
  in a Next.js/SvelteKit/Angular Universal/Solid Start etc. kind of way.

- It is not exactly battle tested - yet. Feel free to improve this :p If you want to get a
  taste of what Mvui can be used to build though, you can have a look at
  [Wournal](https://github.com/dominiksta/wournal/).
