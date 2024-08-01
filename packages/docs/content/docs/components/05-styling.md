---
title: "Styling"
slug: "styling"
weight: 05
bookToC: false
---

# Styling

## Basics

CSS Styling in Mvui is done entirely in JS/TS. Styles are declared as objects that
closesly resemble "normal" CSS syntax. Here is a basic example of a colored 
div, as well as styling an individual element reactively:

{{<codeview>}}
```typescript
import { Component, rx, h, style } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  // By default, you should use this syntax, because it is by far the most
  // optimized - and arguably the most readable, but that is a matter of taste.
  static styles = style.sheet({
    'div': {
      background: 'red',
      height: '20px',
      width: '20px',
    }
  });

  render() {
    const col = new rx.State('green');
    // Don't worry if you do not understand this syntax yet. Think of it
    // like a fancier setInterval for now.
    this.subscribe(rx.interval(1000), () => {
      col.next(c => c === 'green' ? 'orange' : 'green');
    });

    return [
      h.div(),
      // You can also declare styles on a per element basis. This maps directly
      // to using the HTML style attribute. Note how you can use State here!
      h.div({ style: { background: col } }),
    ];
  }
}
```
{{</codeview>}}

## Sharing Styles

The `style.sheet` function actually returns an *array* of CSS rules. This means that you
can use the regular JS spread operator to combine stylesheets. You can use this to share
styles between components, like so:

{{<codeview>}}
```typescript
import { Component, h, style } from "@mvuijs/core";

const SHARED_STYLES = style.sheet({
  'div': {
    background: 'blue',
  }
});

@Component.register
export default class MyComponent extends Component {
  static styles = [
    ...style.sheet({
      'div': {
        background: 'red',
        height: '20px',
        width: '20px',
      }
    }),
    ...SHARED_STYLES,
  ];

  render() { return [ h.div() ]; }
}
```
{{</codeview>}}

Notice how the second definition of the background color overwrites the first one. Mvui
transforms these JS objects to regular CSS under the hood, meaning that regular
overwriting rules apply.

## @-Rules

CSS @-Rules have to be a little different syntactically, because some of them allow
specifying a kind of "nested" sheet. All of them are available under the
[`style.at`](/reference/style/variables/at) namespace. Below is an example of using a
media query to make a component behave differently depending on the screen size.

```typescript
class MyComponent extends Component {
  static styles = [
    ...style.sheet({
      'button': { background: 'green' },
    }),
    style.at.media('screen and (min-width: 900px)', style.sheet({
      'button': { background: 'red' }
    })),
  ]
  // ...
}
```

## Advanced: Static vs Instance Styles

By default, you should be using the *static* `styles` field, which we have done here up
until now as well. However, there are some situations where you may want to change a
components styles *per instance*. One way to do this is to use the "classic" way of
keeping the stylesheet static and changing the classes applied to elements. In a lot if
not most situations, this is preferable for better performance. In some situations though,
you may want to set styles dynamically in JS. For this, Mvui also provides a instance
level `styles` field. Again, please only use this when necessary.

{{<codeview>}}
```typescript
import { Component, h, style } from "@mvuijs/core";

@Component.register
export default class MyComponent extends Component {
  static styles = style.sheet({ 'button': { background: 'green' } });

  render() {
    return [
      h.button({ events: { click: _ => {
        this.styles.next(style.sheet({
          'button': { background: 'brown !important' }
        }));
      }}}, 'Styled Button'),
    ]
  }
}
```
{{</codeview>}}


## Advanced: Style Overrides

Usually, web components do not allow you to overwrite their styles. In general, this is a
good thing, because the styling is arguably part of the components internal structure and
not part of its API. The way to allow styling as part of a components API is usually done
through [CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) or [CSS
variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties). However,
sometimes you might just want to be able to say "I know what I'm doing, let me change
these styles!". For these situations, Mvui lets you overwrite the styling of *other Mvui
components*. This currently does not work for generic web components because there is no
reasonable way to overwrite styles in a Shadow DOM. Below is an example of one Mvui
component overwriting the styling of another Mvui component.

{{<codeview>}}
```typescript
import { Component, h, style } from "@mvuijs/core";

@Component.register
class StyledComponent extends Component {
  static styles = style.sheet({ 'div': {
    background: 'red', width: '20px', height: '20px'
  }});
  render() { return [ h.div('') ]; }
}


@Component.register
export default class StyleOverridingComponent extends Component {
  render() {
    return [
      StyledComponent.t({
        styleOverrides: style.sheet({
          'div': { background: 'blue !important' }
        })
      })
    ]
  }
}
```
{{</codeview>}}

Note that if you *really* want to overwrite the styling of a third party web component,
you *can* do that programatically by pushing a stylesheet to the shadow roots
`adoptedStyleSheets` field (see [this](https://stackoverflow.com/a/47633167) post on
StackOverflow). However, this will break as soon as you create the element again and you
have to take care to not add it mulitple times... it's a big headache that you probably
don't want to deal with.
