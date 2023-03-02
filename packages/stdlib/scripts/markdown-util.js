/**
 * Escape a given string so that special markdown characters will not result in weird
 * formatting. (Admittedly not the most thorough implementation.)
 *
 * @param {string | null} str
 * @returns {string}
 */
function escape(str) {
  if (!str) return '';
  str = str.replaceAll('|', '\\|');
  str = str.replaceAll('`', '\\`');
  str = str.replaceAll('_', '\\_');
  str = str.replaceAll('*', '\\*');
  return str;
}

/**
 * Get markdown as a string for the given description as returned by `descForFile`.
 * @param {object} desc
 * @returns {string}
 */
function markdownReferenceForComponentDescription(desc) {
  let ret = '';

  if (desc.props.length !== 0) {
    ret += '### Props\n\n';
    ret += '| Name  | Type | Default | Description |\n';
    ret += '|-------|------|---------|-------------|\n';
    for (let prop of desc.props) {
      if (prop.propAttr && prop.name !== prop.propAttr) {
        ret += '| ' + escape(prop.name) + ' (' + escape(prop.propAttr) + ') ';
      } else {
        ret += '| ' + escape(prop.name) + ' ';
      }
      ret += '| `' + escape(prop.type)         + '` ';
      ret += '| `' + escape(prop.defaultValue) + '` ';
      ret += '| '  + escape(prop.comment)      + ' ';
      ret += `|\n`;
    }
  }

  if (desc.events.length !== 0) {
    ret += '\n### Events\n\n';
    ret += '| Name  | Type | Description |\n';
    ret += '|-------|------|-------------|\n';
    for (let evt of desc.events) {
      ret += '| '  + escape(evt.name)    + ' ';
      ret += '| `' + escape(evt.type)    + '` ';
      ret += '| '  + escape(evt.comment) + ' ';
      ret += `|\n`;
    }
  }

  if (desc.slots.length !== 0) {
    ret += '\n### Slots\n\n';
    ret += '| Name  | Type | Description |\n';
    ret += '|-------|------|-------------|\n';
    for (let slot of desc.slots) {
      ret += '| '  + escape(slot.name)    + ' ';
      ret += '| `' + escape(slot.type)    + '` ';
      ret += '| '  + escape(slot.comment) + ' ';
      ret += `|\n`;
    }
  }

  if (desc.methods.length !== 0) {
    ret += '\n### Methods\n\n';
    for (let method of desc.methods) {
      ret += '#### `' + escape(method.name) + '`\n\n'

      ret += '*Returns*: `' + escape(method.returns) + '`\n\n';

      ret += '*Parameters*: \n';

      ret += '| Name  | Type | Default | Description |\n';
      ret += '|-------|------|---------|-------------|\n';
      for (let param of method.params) {
        ret += '| '  + escape(param.name)         + ' ';
        ret += '| `' + escape(param.type)         + '` ';
        ret += '| '  + escape(param.defaultValue) + ' ';
        ret += '| '  + escape(param.comment)      + ' ';
        ret += `|\n`;
      }
    }
  }

  return ret;
}

module.exports = { markdownReferenceForComponentDescription };
