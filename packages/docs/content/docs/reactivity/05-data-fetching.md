---
title: "Data Fetching"
slug: "data-fetching"
weight: 05
bookToC: false
---

# Data Fetching

## The Naive "Imperative" Way

```typescript
@Component.register
export default class NaiveFetcher extends Component {
  render() {
    const text = new rx.State('');
    const results = new rx.State<string[]>([]);
    
    return [
      h.input({ fields: { value: rx.bind(text) }}),
      h.button({ events: { click: _ => {
        results.next(await http.get(
          '/api/search', { params: { text: v }}
        ).body);
      }}}),
      results.derive(r => r.map(v => h.li(v)))
    ]
  }
}
```

## The Better "Declarative" Way (with Error Handling)

```typescript
@Component.register
export default class BetterFetcher extends Component {
  render() {
    const text = new rx.State('');
    const results = text.pipe(
      rx.debounceTime(200),
      rx.distinctUntilChanged(),
      rx.showStatus(rx.switchMap(
        v => http.get<string[]>('/api/search', { params: { text: v } })
      ))
    );
    
    return [
      h.input({ fields: { value: rx.bind(text) }}),
      h.button({ events: { click: _ => search('text') }}),
      results.pipe(
        rx.handleStatus({
          failure: e => h.span(`Error: ${e}`),
          success: v => v.body.map(el => h.li(el)),
          loading: _ => h.span('Waiting...'),
        })
      ),
    ]
  }
}
```
