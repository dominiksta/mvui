/**
 * Get a list of all comment blocks in a given string of js
 * @param {string} plainJs - plain in the sense of no typescript
 * @returns {string[][]}
 */
function getCommentBlocks(plainJs) {
  const splitJs = plainJs.split('\n');

  const startLines = splitJs
        .map((v, i) => v.trim().startsWith('/**') ? i : -1)
        .filter(v => v !== -1);

  const docBlocksLineNumbers = startLines.map(startLine => {
    let endLine = -1;
    for (let i = startLine; i < splitJs.length; i++) {
      if (splitJs[i].trim().endsWith('*/')) {
        endLine = i; 
        break;
      }
    }
    if (endLine === -1) throw new Error('could not find end line');

    return { end: endLine, start: startLine + 1 };
  });

  const docBlocks = docBlocksLineNumbers.map(v => {
    let res = [];
    for (let i = v.start; i < v.end; i++) {
      if (splitJs[i].trim() === '*' || splitJs[i].trim() === '') {
        res.push('');
        continue;
      }
      const starIdx = splitJs[i].indexOf(' * ');
      if (starIdx !== -1) {
        res.push(splitJs[i].substring(starIdx + 3));
      } else {
        res.push(splitJs[i]);   
      }
    }
    return res;
  })

  return docBlocks;
}

/**
 * Ensure that a given set of parens (or other) is balanced in a given string.
 *
 * @param {string} str - the base string to find the pair in
 * @param {number} start - where to start searching in the `str`
 * @param {string} open - the opening character (e.g. '{')
 * @param {string} close - the closing character (e.g. '}')
 * @returns {number} - the position of the last `close` char in `str`
 */
function findBalancedChar(str, start, open, close) {
  let parenStack = 1;
  for (let j = start; j < str.length; j++) {
    if (str[j] === open) parenStack++;
    if (str[j] === close) parenStack--;
    // console.debug(str.substring(start), str[j], parenStack);
    if (parenStack === 0) return j;
  }
  throw new Error(
    `could not find balanced ${open} ${close} in ${str.substring(start)}`
  );
}

/**
 * Parse a jsdoc formatted line including its successor lines for comments.
 *
 * @param {string} stringArr - an array of lines in a comment
 * @param {number} startLine - the line of the jsdoc doclet to look at
 * @returns {{
 *   docletType: string,
 *   name: string | null,
 *   type: string | null,
 *   defaultValue: string | null,
 *   comment: string | null,
 * }}
 */
function parseJsdocLine(stringArr, startLine) {
  const doclet = {
      docletType: '', // fires, prop, method, etc.
      type: null,
      defaultValue: null,
      comment: null,
      name: '',
  }

  doclet.docletType = stringArr[startLine].substring(1, stringArr[startLine].indexOf(' '));;
  let parsePos = doclet.docletType.length;

  const hasType = stringArr[startLine][parsePos + 2] === '{';
  if (hasType) {
    const typeStart = parsePos + 3;
    const typeEnd = findBalancedChar(stringArr[startLine], typeStart, '{', '}');
    doclet.type = stringArr[startLine].substring(typeStart, typeEnd);
    parsePos = typeEnd;
  }

  const hasDefaultValue = stringArr[startLine][parsePos + 2] === '[';

  if (hasDefaultValue) {
    const defaultStart = parsePos + 3;
    parsePos = findBalancedChar(stringArr[startLine], defaultStart, '[', ']');
    const nameWithDefault = stringArr[startLine].substring(
      defaultStart, parsePos
    ).split('=');
    doclet.name = nameWithDefault[0];
    doclet.defaultValue = nameWithDefault[1];
  } else {
    const nameStart = parsePos + 2;
    parsePos = stringArr[startLine].substring(parsePos + 2).indexOf(' ') + parsePos + 1;
    if (parsePos < nameStart) parsePos = stringArr[startLine].length;
    doclet.name = stringArr[startLine]
      .substring(nameStart, parsePos + 1);
  }

  const hasComment = stringArr[startLine][parsePos + 2] === '-';

  if (hasComment) {
    doclet.comment = stringArr[startLine].substring(parsePos + 4);
    for (let j = startLine + 1; j < stringArr.length; j++) {
      if (stringArr[j].startsWith('@') || stringArr[j] === '') break;
      doclet.comment += stringArr[j];
    }
  }

  return doclet;
}

/**
 * Prase a given comment block into either an object describing a method or class,
 * depending on wether @class or @function is present in the block.
 *
 * @param {string[]} docBlock
 */
function parseJsdoc(docBlock) {
  // @fires {CustomEvent<{hi: number}>} click - Dispatched after user click
  // @prop {number} [value=4] - comment

  let parsed = [];
  for (let i = 0; i < docBlock.length; i++) {
    if (docBlock[i].startsWith('@')) parsed.push(parseJsdocLine(docBlock, i));
  }

  const docletTypes = parsed.map(doclet => doclet.docletType);
  const isClass = docletTypes.indexOf('class') !== -1;
  const isMethod = docletTypes.indexOf('function') !== -1;
  if (isClass && isMethod) throw new Error('block can only be a class or function');

  let ret = {
    description: getDescription(docBlock).join('\n'),
    kind: '',
  };

  if (isClass) {
    ret.kind = 'class';

    // join attrs with their props
    // ----------------------------------------------------------------------

    for (let i = 0; i< parsed.length; i++) {
      if (parsed[i].docletType === 'attr') {
        if (parsed[i + 1].docletType !== 'prop') {
          throw new Error('@attr may only precede @prop');
        }
        parsed[i + 1].propAttr = parsed[i].name;
      }
    }

    parsed = parsed.filter(p => p.docletType !== 'attr');

    // ----------------------------------------------------------------------

    ret.name = parsed.find(p => p.docletType === 'class').name;

    ret.props = parsed.filter(p => p.docletType === 'prop').map(p => {
      const ret = { ...p };
      delete ret.docletType;
      return ret;
    });

    ret.events = parsed.filter(p => p.docletType === 'fires').map(p => {
      const ret = { ...p };
      delete ret.docletType;
      delete ret.defaultValue;
      return ret;
    });

    ret.slots = parsed.filter(p => p.docletType === 'slot').map(p => {
      const ret = { ...p };
      delete ret.docletType;
      delete ret.defaultValue;
      return ret;
    });

  } else if (isMethod) {
    ret.kind = 'method';

    ret.name = parsed.find(p => p.docletType === 'function').name;
    
    ret.params = parsed.filter(p => p.docletType === 'param').map(p => {
      const ret = { ...p };
      delete ret.docletType;
      return ret;
    });

    ret.returns = parsed.find(p => p.docletType === 'returns').type;
  }

  return ret;
}

/**
 * Get the description of a given comment block
 *
 * @param {string[]} docBlock
 * @return {string[]}
 */
function getDescription(docBlock) {
  const firstAt = docBlock.map(line => line.startsWith('@')).indexOf(true);
  return docBlock.slice(0, firstAt);
}

module.exports = { getCommentBlocks, parseJsdoc };
