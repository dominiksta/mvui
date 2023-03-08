const fs = require('fs');

/**
 * This script will simply append a hugo alias to the yaml frontmatter of the main "entry"
 * markdown file of the api reference.
 */

const INSERT = "aliases:\n  - /tutorial/reference/";
const PATH = 'content/reference/modules.md';

/**
 * @param {string} fileContent
 * @returns {{start: number, end: number}}
 */
function getFrontMatterPos(fileContent) {
  const start = fileContent.indexOf('---') + 4;
  const end = fileContent.substring(start).indexOf('---') + 3;
  return { start, end };
}

/**
 * @param {string} fileContent
 * @param {string} newFrontMatter
 * @returns {string}
 */
function addToFrontMatter(fileContent, newFrontMatter) {
  const { start, end } = getFrontMatterPos(fileContent);

  return fileContent.substring(0, end) + '\n' +
    newFrontMatter +
    fileContent.substring(end);
}

const fileContent = fs.readFileSync(PATH).toString();
fs.writeFileSync(PATH, addToFrontMatter(fileContent, INSERT));

