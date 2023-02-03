/**
 * This module simply defines default functions for creating html elements
 * in templates.
 *
 * @example
 * ```typescript
 * // ...
 * render = () => [
 *   h.h1('Heading'),
 *   h.div({ attrs: { id }}, 'Some Content'),
 * ]
 * // ...
 * ```
 *
 * @module html
 */

export * from './content-sectioning';
export * from './demarcating-edits';
export * from './forms';
export * from './image-and-multimedia';
export * from './inline-text-semantics';
export * from './interactive-elements';
export * from './scripting';
export * from './table-content';
export * from './text-content';
export * from './web-components';

export type { HtmlTemplateElChildrenOrParams } from './util';
