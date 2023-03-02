import { Component, define, h, rx, style } from "@mvui/core";
import { button } from "./button";
import theme from '../theme';

/**
   A container that can be collapsed and expanded at will.

   @class Collapsible

   @attr initial-collapsed
   @prop {boolean} [initialCollapsed=false] -
   When set to true, the collapsible will initially be collapsed.

   @attr collapsed
   @prop {boolean} [collapsed=false] -
   Whether the component is currently collapsed.

   @slot {any} default -
   The body that will be conditionally displayed or hidden

   @slot {any} header -
   This will be shown as the clickable header that will toggle wether the content is
   collapsed.
 */
export const [collapsible, Collapsible] = define(class Collapsible extends Component {
  static tagNameLibrary = 'std';

  props = {
    initialCollapsed: new rx.Prop<boolean>(
      false, { reflect: true, converter: Boolean }
    ),
    collapsed: new rx.Prop<boolean>(
      false, { reflect: true, converter: Boolean }
    ),
  }

  render() {
    const { collapsed, initialCollapsed } = this.props;
    if (initialCollapsed.value) collapsed.next(true);
    // this.subscribe(collapsed, console.log);

    return [
      h.div(
        { attrs: { id: 'wrapper' } },
        [
          button({
            attrs: { id: 'header' },
            events: { click: _ => collapsed.next(!collapsed.value) },
          }, [
            h.div(
              { attrs: { id: 'header' }},
              h.slot({ attrs: { name: 'header' } })
            ),
            h.div(
              { attrs: { id: 'indicator' } },
              collapsed.select(c => c ? '-' : '+'),
            ),
          ]),
          h.div({
            attrs: { id: 'content' },
            style: {
              display: collapsed.map(c => c ? 'none' : 'block'),
            },
          },
            h.slot()
          ),
        ]
      )
    ];
  }

  static styles = style.sheet({
    ':host': {
      display: 'block',
    },
    '#wrapper': {
      border: `1px solid ${theme.fg}`,
      marginRight: '5px',
      boxShadow: `5px 5px ${theme.fgContrastMiddle}`,
    },
    '#content': {
      padding: '1em',
    },
    '#header': {
      width: '100%',
    },

    '#header::part(button)': {
      border: 'none',
      textAlign: 'left',
    },
    '#header::part(button):hover': {
      outline: 'none',
      background: theme.bgContrastMiddle,
    },
    '#header::part(button):active': {
      background: theme.fg,
    },

    '#header > #header': {
      display: 'inline-block',
      fontSize: '120%',
      width: '80%',
    },
    '#header > #indicator': {
      display: 'inline-block',
      width: 'calc(20% - 0.5em)',
      textAlign: 'right',
      fontFamily: 'monospace',
      paddingRight: '0.5em',
    }
  });
});
