---
title: "Overview"
slug: "overview"
weight: 01
bookToC: false
---

# Overview

In the previous sections, we have already used `State` objects and briefly mentioned
`Subscriptions` and `DerivedState`. This chapter will go more into detail on how
reactivity works in Mvui.

Fundamentally, we will talk about two seperate domains: *synchronous* and *asynchronous*
reactivity. The former deals with manipulating local state and the latter with things like
HTTP API calls, timers, etc.

## Inspiration and Credits (<3 RxJS)

This section is optional and intended both as an acknowledgement of the amazing RxJS
library and as a guide to those already familiar with RxJS that want to learn Mvui.

Mvui's reactivity is *heavily* inspired by RxJS, to the point where many concepts are
really the same as in RxJS. In fact, most of the operators are pretty much just copied
verbatim (the implementation may differ, but the interface is the same). There are only
three key differences. First, the names of the base classes have been changed:

| Name in RxJS     | Name in Mvui    |
|:-----------------|:----------------|
| Observable       | Stream          |
| Subject          | MulticastStream |
| BehaviourSubject | State           |

While the names in RxJS are sane and based on functional programming lingo, the names in
Mvui should hopefully be more clear to those used to other frontend frameworks.

Second, Mvui allows for synchronously derived State (memoized and available without
subscribing). This feature was also the real motivation for not just using RxJS as is.

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

const num = new rx.State(0);
const plusOne = num.derive(n => n + 1);
console.log(plusOne.value);
```
{{</codeview>}}

And lastly, there are more frontend framework specific features such as a redux-like
`Store`, a react-like `Context` or the [`handleStatus`](/docs/reactivity/data-fetching/)
operator.

It should be mentioned that RxJS is of course a lot more feature-rich for asynchronous
reactivity and battle-tested. There are likely some edge-cases where Mvui behaves slightly
in a slightly different way.
