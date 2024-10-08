import foreach from "./foreach";
import { fragment } from "./fragment";
import { Stream } from "./rx";
import {
  TemplateElement, TemplateElementCreator
} from "./template-element";

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
const h: {
  [key in keyof HTMLElementTagNameMap]:
  TemplateElementCreator<HTMLElementTagNameMap[key]>
} & {
  custom: typeof TemplateElement.fromCustom,
  fragment: typeof fragment,
  foreach: typeof foreach,
} = {
  a          : TemplateElement.fromCustom('a'),
  abbr       : TemplateElement.fromCustom('abbr'),
  address    : TemplateElement.fromCustom('address'),
  area       : TemplateElement.fromCustom('area'),
  article    : TemplateElement.fromCustom('article'),
  aside      : TemplateElement.fromCustom('aside'),
  audio      : TemplateElement.fromCustom('audio'),
  b          : TemplateElement.fromCustom('b'),
  base       : TemplateElement.fromCustom('base'),
  bdi        : TemplateElement.fromCustom('bdi'),
  bdo        : TemplateElement.fromCustom('bdo'),
  blockquote : TemplateElement.fromCustom('blockquote'),
  body       : TemplateElement.fromCustom('body'),
  br         : TemplateElement.fromCustom('br'),
  button     : TemplateElement.fromCustom('button'),
  canvas     : TemplateElement.fromCustom('canvas'),
  caption    : TemplateElement.fromCustom('caption'),
  cite       : TemplateElement.fromCustom('cite'),
  code       : TemplateElement.fromCustom('code'),
  col        : TemplateElement.fromCustom('col'),
  colgroup   : TemplateElement.fromCustom('colgroup'),
  data       : TemplateElement.fromCustom('data'),
  datalist   : TemplateElement.fromCustom('datalist'),
  dd         : TemplateElement.fromCustom('dd'),
  del        : TemplateElement.fromCustom('del'),
  details    : TemplateElement.fromCustom('details'),
  dfn        : TemplateElement.fromCustom('dfn'),
  dialog     : TemplateElement.fromCustom('dialog'),
  div        : TemplateElement.fromCustom('div'),
  dl         : TemplateElement.fromCustom('dl'),
  dt         : TemplateElement.fromCustom('dt'),
  em         : TemplateElement.fromCustom('em'),
  embed      : TemplateElement.fromCustom('embed'),
  fieldset   : TemplateElement.fromCustom('fieldset'),
  figcaption : TemplateElement.fromCustom('figcaption'),
  figure     : TemplateElement.fromCustom('figure'),
  footer     : TemplateElement.fromCustom('footer'),
  form       : TemplateElement.fromCustom('form'),
  h1         : TemplateElement.fromCustom('h1'),
  h2         : TemplateElement.fromCustom('h2'),
  h3         : TemplateElement.fromCustom('h3'),
  h4         : TemplateElement.fromCustom('h4'),
  h5         : TemplateElement.fromCustom('h5'),
  h6         : TemplateElement.fromCustom('h6'),
  head       : TemplateElement.fromCustom('head'),
  header     : TemplateElement.fromCustom('header'),
  hgroup     : TemplateElement.fromCustom('hgroup'),
  hr         : TemplateElement.fromCustom('hr'),
  html       : TemplateElement.fromCustom('html'),
  i          : TemplateElement.fromCustom('i'),
  iframe     : TemplateElement.fromCustom('iframe'),
  img        : TemplateElement.fromCustom('img'),
  input      : TemplateElement.fromCustom('input'),
  ins        : TemplateElement.fromCustom('ins'),
  kbd        : TemplateElement.fromCustom('kbd'),
  label      : TemplateElement.fromCustom('label'),
  legend     : TemplateElement.fromCustom('legend'),
  li         : TemplateElement.fromCustom('li'),
  link       : TemplateElement.fromCustom('link'),
  main       : TemplateElement.fromCustom('main'),
  map        : TemplateElement.fromCustom('map'),
  mark       : TemplateElement.fromCustom('mark'),
  menu       : TemplateElement.fromCustom('menu'),
  meta       : TemplateElement.fromCustom('meta'),
  meter      : TemplateElement.fromCustom('meter'),
  nav        : TemplateElement.fromCustom('nav'),
  noscript   : TemplateElement.fromCustom('noscript'),
  object     : TemplateElement.fromCustom('object'),
  ol         : TemplateElement.fromCustom('ol'),
  optgroup   : TemplateElement.fromCustom('optgroup'),
  option     : TemplateElement.fromCustom('option'),
  output     : TemplateElement.fromCustom('output'),
  p          : TemplateElement.fromCustom('p'),
  picture    : TemplateElement.fromCustom('picture'),
  pre        : TemplateElement.fromCustom('pre'),
  progress   : TemplateElement.fromCustom('progress'),
  q          : TemplateElement.fromCustom('q'),
  rp         : TemplateElement.fromCustom('rp'),
  rt         : TemplateElement.fromCustom('rt'),
  ruby       : TemplateElement.fromCustom('ruby'),
  s          : TemplateElement.fromCustom('s'),
  samp       : TemplateElement.fromCustom('samp'),
  script     : TemplateElement.fromCustom('script'),
  section    : TemplateElement.fromCustom('section'),
  select     : TemplateElement.fromCustom('select'),
  slot       : TemplateElement.fromCustom('slot'),
  small      : TemplateElement.fromCustom('small'),
  source     : TemplateElement.fromCustom('source'),
  span       : TemplateElement.fromCustom('span'),
  strong     : TemplateElement.fromCustom('strong'),
  style      : TemplateElement.fromCustom('style'),
  sub        : TemplateElement.fromCustom('sub'),
  summary    : TemplateElement.fromCustom('summary'),
  sup        : TemplateElement.fromCustom('sup'),
  table      : TemplateElement.fromCustom('table'),
  tbody      : TemplateElement.fromCustom('tbody'),
  td         : TemplateElement.fromCustom('td'),
  template   : TemplateElement.fromCustom('template'),
  textarea   : TemplateElement.fromCustom('textarea'),
  tfoot      : TemplateElement.fromCustom('tfoot'),
  th         : TemplateElement.fromCustom('th'),
  thead      : TemplateElement.fromCustom('thead'),
  time       : TemplateElement.fromCustom('time'),
  title      : TemplateElement.fromCustom('title'),
  tr         : TemplateElement.fromCustom('tr'),
  track      : TemplateElement.fromCustom('track'),
  u          : TemplateElement.fromCustom('u'),
  ul         : TemplateElement.fromCustom('ul'),
  var        : TemplateElement.fromCustom('var'),
  video      : TemplateElement.fromCustom('video'),
  wbr        : TemplateElement.fromCustom('wbr'),

  custom     : TemplateElement.fromCustom,
  fragment   : fragment,
  foreach    : foreach,
} as any;

export default h;
