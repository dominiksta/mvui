Reference for the Core of Mvui.

```typescript
// more to come
```


## Why the class Syntax?

### It really is not that big of a difference

Firstly, using a class Syntax is barely any overhead in syntax. The following example
shows a simple component using both the existing class-based syntax and a fictional
functional syntax. The functional example is only one line of code less.

```typescript
class MyComponent extends Component {
  props = {
    value1: new Prop(1),
    value2: new Prop(2),
  }

  render() {
    const state = new State(0);

    return [
      h.div(state), h.div(value1), h.div(value2),
    ]
  }
}
```

```typescript
function MyComponent({
  value1 = new Prop(1),
  value2 = new Prop(2),
}: {
  value1: Prop<number>,
  value2: Prop<number>,
}) {
  const state = new State(0);

  return [
    h.div(state), h.div(value1), h.div(value2),
  ]
}
```

### Typed Events and Generics

An issue with this fictional functional syntax is that we cannot store additional type
information for events in the function:

```typescript
type MyEvents = {
  change: number
}

function MyComponent() {
  dispatch<MyEvents>(1);
  return []
}

function OtherComponent() {
  return [
    MyComponent({ events: {
      change: e => e.detail // ... how is this supposed to know the type?
    }})
  ]
}
```

Libraries like Solid and React can get around this problem by simply not using events in
their component system and instead relying on passing callbacks. This is not an option for
mvui as it is supposed to be a web components first library.

We could possibly come up with a different syntax like this:

```typescript
const MyComponent = define<MyEvents>(function() {
  // ...
})
```

However, this would not work when trying to use a generic type parameter in the events.
Consider the folling (working) example:

```typescript
type MyEvents<T> = {
  change: T
}

class GenericComp<T> extends Component<MyEvents<T>> {
  props = {
    value: new rx.Prop<T | undefined>(undefined)
  }
  render = () => [];
}

class UserComp extends Component {
  render() {
    const state1 = new rx.State(0);
    const state2 = new rx.State('hi');
    return [
      (GenericComp<number>).new({
        props: { value: state1 },
        events: { change: e => state1.next(e.detail) }
      }),
      (GenericComp<string>).new({
        props: { value: state2 },
        events: { change: e => state2.next(e.detail) }
      })
    ]
  }
}
```

This is a generic component that uses its generic type in its custom events. With a
functional syntax, this would not be possible for mvui, at least not without some
significant complications. The reason is the scoping of these paremeters.

```typescript
// how should MyEvents be able to know about T here?
const MyComponent = define<MyEvents>(function<T>() {
  // ...
})
```

Maybe there is a solution to this problem, but it is definitely not obvious.
