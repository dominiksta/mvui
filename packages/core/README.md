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

### Generics and Typed Events

TODO
