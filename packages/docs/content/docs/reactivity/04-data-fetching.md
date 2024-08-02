---
title: "Data Fetching"
slug: "data-fetching"
weight: 04
bookToC: false
---

# Data Fetching

This is really what the basics of the previous chapter on [asynchronous
reactivity](/mvui/docs/reactivity/asynchronous/) has been building up to. Fetching data
over an HTTP API or similar when a user clicks a button or types in an `<input>` is easily
one of the most common things you have to do in a frontend environment.

There are many complex requirements to think about here: You may want to debounce the user
input, there should be some policy on retries, you want to discard old requests, you may
want to provide fallback values, only send a request when the `<input>` value has actually
changed, handle errors (potentially by displaying them to the user) and potentially even
more. Mvui has an opinion on how to do all of this with `Stream`s and operators.

If you want more motivation in video format, Joshua Morony has made an [excellent
video](https://www.youtube.com/watch?v=-CoVmNvp_1g) on why this stuff matters and why
RxJS-like reactivity is a good solution to the problem. Honestly just watch that video now
and then come back to this page.

## The Naive "Imperative" Way

First, lets consider how to implement a search box in a naive, "imperative" way. The
example below shows how you might go about doing that. Try typing rapidly in the search
box and see how the search results sometimes do not match the most recent thing you typed.

{{<codeview output-height="6em">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const mockSearch = (needle: string): Promise<string[]> =>
  new Promise(resolve => { setTimeout(
    () => resolve([ 'results', 'for', needle ]),
    Math.random() * (1000 - 200) + 200 // wait 200-1000 ms
  )});

@Component.register
export default class NaiveFetcher extends Component {
  render() {
    const text = new rx.State('initial');
    const results = new rx.State<string[]>([]);
    this.subscribe(text, async val => {
      results.next(await mockSearch(val));
    });
    
    return [
      h.input({ fields: { value: rx.bind(text) }}),
      h.div(results.derive(r => r.map(v => h.li(v)))),
    ]
  }
}
```
{{</codeview>}}

## The Better "Declarative" Way

The example below avoids the problem of mismatched search results entirely and it's even a
bit *less* code. If you are feeling masochistic, try getting that to work without using a
`switchMap`. It will take quite a bit of code and potentially some hair loss.

The magic of `switchMap` is probably best explained by other resources, particularly [this
post](https://blog.angular-university.io/rxjs-switchmap-operator/) on "angular
university". But really, this example is probably exactly how you are going to use it most
of the time.

{{<codeview output-height="6em">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const mockSearch = (needle: string): Promise<string[]> =>
  new Promise(resolve => { setTimeout(
    () => resolve([ 'results', 'for', needle ]),
    Math.random() * (1000 - 200) + 200 // wait 200-1000 ms
  )});

@Component.register
export default class BetterFetcher extends Component {
  render() {
    const text = new rx.State('initial');
    const results = text.pipe(rx.switchMap(mockSearch));
    
    return [
      h.input({ fields: { value: rx.bind(text) }}),
      h.div(results.map(r => r.map(v => h.li(v)))),
    ]
  }
}
```
{{</codeview>}}

## Now we're just Flexing

Finally, the "kitchen sink" example: This does not just ensure the proper "API" response
is shown. It also handles errors (a bit crudely by showing it to the user), displaying a
"loading" status to the user, not issuing a request when the `<input>` value was the same
and retrying a potentially failed request 3 times before giving up.

Now, if you really enjoy pain try writing that yourself without this sort of RxJS-style
asynchronous reactivity.

{{<codeview output-height="6em">}}
```typescript
import { Component, rx, h } from '@mvuijs/core';

const mockSearch = (needle: string): Promise<string[]> =>
  new Promise(resolve => { setTimeout(
    () => resolve([ 'results', 'for', needle ]),
    Math.random() * (1000 - 200) + 200 // wait 200-1000 ms
  )});

@Component.register
export default class BetterFetcher extends Component {
  render() {
    const text = new rx.State('initial');
    const results = text.pipe(
      rx.distinctUntilChanged(),
      rx.showStatus(rx.pipe(
        rx.switchMap(mockSearch),
        rx.retry(3),
      ))
    );
    
    return [
      h.input({ fields: { value: rx.bind(text) }}),
      h.div(results.pipe(
        rx.handleStatus({
          success: r => r.map(v => h.li(v)),
          waiting: _ => 'loading',
          error: _ => 'error',
        })
      )),
    ]
  }
}
```
{{</codeview>}}
