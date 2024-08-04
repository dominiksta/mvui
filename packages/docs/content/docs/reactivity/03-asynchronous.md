---
title: "Asynchronous"
slug: "asynchronous"
weight: 03
bookToC: false
---

# Asynchronous Reactivity

Asynchronous reactivity in Mvui is achieved with the `Stream` primitive. (In fact, a
`State` object is a subclass of a `Stream`) The idea is that a `Stream` represents an
asynchronous, well, stream of data. For example, you can use the `rx.interval` function to
create a stream of increasing numbers in a given interval, much like the JS builtin
`setInterval`:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.interval(2000).subscribe(console.log);
```
{{</codeview>}}

In general, Mvui's asynchronous reactivity is *very* similar to **RxJS**. If you want more
advanced resources and tutorials about asynchronous reactivity in Mvui, we strongly
recommend that you look at some of the millions of posts, articles, books, etc. about
RxJS. The only major differences to keep in mind is that Mvui is missing some of the more
niche and advanced operators and the naming of the base classes: An RxJS `Observable` is
an Mvui `Stream`, an RxJS `Subject` is an Mvui `MulticastStream` and an RxJS
`BehaviourSubject` is an Mvui `State`. Having said that, this guide should still serve as
a reasonable introduction to the basic concepts.

What really makes `Stream`s powerful is the variety of *operators* that are
provided. These are *pure*(ish) functions that transform the incoming data in some way,
and they can be chained together with the `pipe` method of a `Stream`. Below is an example
using the `map` and `filter` operators, which function like their plain JS array
equivalents. The example also uses the `take` operator, which *completes* (more on that
later) the stream after *n* values were emitted. The `take` operator is also a good
example of a non-pure operator, because it obviously needs to store some internal state to
keep track of how many values were already emitted.

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.interval(2000).pipe(
  rx.take(5),
  rx.map(n => n + 1),
  rx.filter(n => n !== 3),
).subscribe(console.log);
```
{{</codeview>}}

Fundamentally, there are two different *types* of operators: **creation** operators (such
as `rx.interval`) which create a `Stream` and **transformation** operators, which
transform an existing `Stream` with a function (like `rx.map`, `rx.filter` and `rx.take`). For a list of available operators, see the [API docs](/mvui/reference/rx/rx/#stream-operators).

With these basic concepts, you can build complex processing pipelines with little
code. For example, you can process user events from an input, debounce them, make HTTP API
calls and cancel old requests all in a few lines of code! This is an example we will
discuss shortly, but for now take this as some motivation to read on further.

## Hot vs Cold

At this point it is appropriate to talk about how `Streams` are evaluated/run. By default,
creating a `Stream` will do nothing *until you subscribe* to it. Think of this like a
function call: When you define a function, it does nothing until you call it. In fact, the
function analogy goes further: Each time you subscribe to a `Stream`, it creates a new
"instance" of that `Stream`, much like calling a function multiple times will execute it
multiple times (duh). This behaviour is typically referred to as a *cold* `Stream`.

{{<codeview output-height="6em">}}
```typescript
import { rx } from '@mvuijs/core';

const myStream = rx.from([1, 2]);
myStream.subscribe(console.log); // prints 1, 2 the first time
myStream.subscribe(console.log); // prints 1, 2 a second time
```
{{</codeview>}}

Now, the existence of a cold `Stream` implies that there are *hot* `Stream`s. And yes,
they do in fact exist. Hot `Stream`s can model something that persistently emits data not
just when there is a subscription. For example, `rx.fromEvent` creates a hot `Stream` from
DOM events, where data is shared between subscribers. When there is currently no
subscription to the `Stream`, the data is simply "lost".

You can create your own hot `Stream`s with the
[`rx.share`](/mvui/reference/rx/functions/share/) operator and this will create a
[`MulticastStream`](/mvui/reference/rx/classes/multicaststream/) under the hood, but that
is a topic for more advanced users.

## Completing, Throwing Errors and Memory Leaks

When you just run `rx.interval(1000).subscribe(myFunction)`, the execution will never
terminate. This can create unnecessary overhead and potentially even memory leaks. We have
already mentioned this in our discussion of `State` in the previous chapter about
synchronous reactivity. In this scenario, you should always take care of unsubscribing
from the `Stream`. If you use that `Stream` in an Mvui template, Mvui will unsubscribe on
component unmount for you.

What we only mentioned in passing until now is that `Streams` can *complete* their
execution. Subscribing to a Stream that will definitely complete is safe and will not
cause performance degradation of memory leaks. For example, the `Stream` `rx.from([1, 2])`
will emit the values *1* and *2* and then complete.

You can explicitly listen to the complete event in your subscription like so:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.from([1, 2]).subscribe({
  next: val => console.log(`next: ${val}`),
  complete: _ => console.log('completed'),
});
```
{{</codeview>}}

Additionally, Streams can throw errors during execution. You can again listen to these in
a similar way:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.from([1, 2]).pipe(
  rx.map(v => {
    if (v == 2) throw new Error('hi');
    else return v;
  }),
).subscribe({
  next: val => console.log(`next: ${val}`),
  error: e => console.log(`error: ${e}`),
});
```
{{</codeview>}}

What makes this especially interesting that *operators* can also listen for errors and
handle them in various ways. For example, the `rx.retry` operator will, well, retry
executing the `Stream` it is used in when an error occurs. Below is the same previous
example except with one retry:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.from([1, 2]).pipe(
  rx.map(v => {
    if (v == 2) throw new Error('hi');
    else return v;
  }),
  rx.retry(1),
).subscribe({
  next: val => console.log(`next: ${val}`),
  error: e => console.log(`error: ${e}`),
});
```
{{</codeview>}}

You can also use the `catchError` operator to handle these errors yourself:

{{<codeview>}}
```typescript
import { rx } from '@mvuijs/core';

rx.from([1, 2]).pipe(
  rx.map(n => {
    if (n === 2) throw 'four!';
    return n;
  }),
  rx.catchError(_ => rx.from(['I', 'II'])),
).subscribe(console.log);
```
{{</codeview>}}
