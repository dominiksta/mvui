import TemplateElement from "./template-element";

type HTMLTemplateElement<T extends keyof HTMLElementTagNameMap> = (
  childrenOrParams?: TemplateElement<HTMLElementTagNameMap[T]>['children'] |
    TemplateElement<HTMLElementTagNameMap[T]>['params'],
  children?: TemplateElement<HTMLElementTagNameMap[T]>['children'],
) => TemplateElement<HTMLElementTagNameMap[T]>;

function genHTMLTemplateEl<T extends keyof HTMLElementTagNameMap>(tagName: T) {
    return function(
      childrenOrParams?: TemplateElement<HTMLElementTagNameMap[T]>['children'] |
        TemplateElement<HTMLElementTagNameMap[T]>['params'],
      children?: TemplateElement<HTMLElementTagNameMap[T]>['children'],
    ) {
      return new TemplateElement<HTMLElementTagNameMap[T]>(
        () => document.createElement(tagName), childrenOrParams, children
      )
    }
}

/**
 * A collection of functions that create a TemplateElement for all standard html elements.
 *
 * @example
 * ```typescript
 * class Example extends Component {
 *   render = () => [
 *     h.div({ attrs: { id: 'hi' }}, h.span('A child <span> element'))
 *   ]
 * }
 * ```
 */
const h: { [key in keyof HTMLElementTagNameMap]: HTMLTemplateElement<key> } =  {
  a          : genHTMLTemplateEl('a'),
  abbr       : genHTMLTemplateEl('abbr'),
  address    : genHTMLTemplateEl('address'),
  area       : genHTMLTemplateEl('area'),
  article    : genHTMLTemplateEl('article'),
  aside      : genHTMLTemplateEl('aside'),
  audio      : genHTMLTemplateEl('audio'),
  b          : genHTMLTemplateEl('b'),
  base       : genHTMLTemplateEl('base'),
  bdi        : genHTMLTemplateEl('bdi'),
  bdo        : genHTMLTemplateEl('bdo'),
  blockquote : genHTMLTemplateEl('blockquote'),
  body       : genHTMLTemplateEl('body'),
  br         : genHTMLTemplateEl('br'),
  button     : genHTMLTemplateEl('button'),
  canvas     : genHTMLTemplateEl('canvas'),
  caption    : genHTMLTemplateEl('caption'),
  cite       : genHTMLTemplateEl('cite'),
  code       : genHTMLTemplateEl('code'),
  col        : genHTMLTemplateEl('col'),
  colgroup   : genHTMLTemplateEl('colgroup'),
  data       : genHTMLTemplateEl('data'),
  datalist   : genHTMLTemplateEl('datalist'),
  dd         : genHTMLTemplateEl('dd'),
  del        : genHTMLTemplateEl('del'),
  details    : genHTMLTemplateEl('details'),
  dfn        : genHTMLTemplateEl('dfn'),
  dialog     : genHTMLTemplateEl('dialog'),
  div        : genHTMLTemplateEl('div'),
  dl         : genHTMLTemplateEl('dl'),
  dt         : genHTMLTemplateEl('dt'),
  em         : genHTMLTemplateEl('em'),
  embed      : genHTMLTemplateEl('embed'),
  fieldset   : genHTMLTemplateEl('fieldset'),
  figcaption : genHTMLTemplateEl('figcaption'),
  figure     : genHTMLTemplateEl('figure'),
  footer     : genHTMLTemplateEl('footer'),
  form       : genHTMLTemplateEl('form'),
  h1         : genHTMLTemplateEl('h1'),
  h2         : genHTMLTemplateEl('h2'),
  h3         : genHTMLTemplateEl('h3'),
  h4         : genHTMLTemplateEl('h4'),
  h5         : genHTMLTemplateEl('h5'),
  h6         : genHTMLTemplateEl('h6'),
  head       : genHTMLTemplateEl('head'),
  header     : genHTMLTemplateEl('header'),
  hgroup     : genHTMLTemplateEl('hgroup'),
  hr         : genHTMLTemplateEl('hr'),
  html       : genHTMLTemplateEl('html'),
  i          : genHTMLTemplateEl('i'),
  iframe     : genHTMLTemplateEl('iframe'),
  img        : genHTMLTemplateEl('img'),
  input      : genHTMLTemplateEl('input'),
  ins        : genHTMLTemplateEl('ins'),
  kbd        : genHTMLTemplateEl('kbd'),
  label      : genHTMLTemplateEl('label'),
  legend     : genHTMLTemplateEl('legend'),
  li         : genHTMLTemplateEl('li'),
  link       : genHTMLTemplateEl('link'),
  main       : genHTMLTemplateEl('main'),
  map        : genHTMLTemplateEl('map'),
  mark       : genHTMLTemplateEl('mark'),
  menu       : genHTMLTemplateEl('menu'),
  meta       : genHTMLTemplateEl('meta'),
  meter      : genHTMLTemplateEl('meter'),
  nav        : genHTMLTemplateEl('nav'),
  noscript   : genHTMLTemplateEl('noscript'),
  object     : genHTMLTemplateEl('object'),
  ol         : genHTMLTemplateEl('ol'),
  optgroup   : genHTMLTemplateEl('optgroup'),
  option     : genHTMLTemplateEl('option'),
  output     : genHTMLTemplateEl('output'),
  p          : genHTMLTemplateEl('p'),
  picture    : genHTMLTemplateEl('picture'),
  pre        : genHTMLTemplateEl('pre'),
  progress   : genHTMLTemplateEl('progress'),
  q          : genHTMLTemplateEl('q'),
  rp         : genHTMLTemplateEl('rp'),
  rt         : genHTMLTemplateEl('rt'),
  ruby       : genHTMLTemplateEl('ruby'),
  s          : genHTMLTemplateEl('s'),
  samp       : genHTMLTemplateEl('samp'),
  script     : genHTMLTemplateEl('script'),
  section    : genHTMLTemplateEl('section'),
  select     : genHTMLTemplateEl('select'),
  slot       : genHTMLTemplateEl('slot'),
  small      : genHTMLTemplateEl('small'),
  source     : genHTMLTemplateEl('source'),
  span       : genHTMLTemplateEl('span'),
  strong     : genHTMLTemplateEl('strong'),
  style      : genHTMLTemplateEl('style'),
  sub        : genHTMLTemplateEl('sub'),
  summary    : genHTMLTemplateEl('summary'),
  sup        : genHTMLTemplateEl('sup'),
  table      : genHTMLTemplateEl('table'),
  tbody      : genHTMLTemplateEl('tbody'),
  td         : genHTMLTemplateEl('td'),
  template   : genHTMLTemplateEl('template'),
  textarea   : genHTMLTemplateEl('textarea'),
  tfoot      : genHTMLTemplateEl('tfoot'),
  th         : genHTMLTemplateEl('th'),
  thead      : genHTMLTemplateEl('thead'),
  time       : genHTMLTemplateEl('time'),
  title      : genHTMLTemplateEl('title'),
  tr         : genHTMLTemplateEl('tr'),
  track      : genHTMLTemplateEl('track'),
  u          : genHTMLTemplateEl('u'),
  ul         : genHTMLTemplateEl('ul'),
  var        : genHTMLTemplateEl('var'),
  video      : genHTMLTemplateEl('video'),
  wbr        : genHTMLTemplateEl('wbr'),
}

export default h;
