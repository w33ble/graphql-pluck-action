const fs = require('fs').promises;
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { glob } = require('glob');
const { asyncMap, asyncFilter, asyncFlow } = require('fp-async-utils');
const { print } = require('graphql');
/**
 * @param {string} source
 * @returns {Promise<string[]>}
 */
async function getFilepaths(source) {
  return new Promise((resolve, reject) => {
    glob(source, { nonull: true }, (err, filePaths) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePaths);
      }
    });
  });
}

/**
 * @param {string} filePath
 * @returns {Promise<{filePath: string, content: string}>}
 */
async function getContent(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return { filePath, content };
}

/**
 *
 * @param {{filePath: string, content: string}} param0
 * @returns {Promise<string>}
 */
async function pluckGQL({ filePath, content }) {
  const [plucked] = await gqlPluckFromCodeString(filePath, content);
  return plucked && plucked.body;
}

/**
 * @param {string[]} schemas
 * @returns {Promise<string>}
 */
async function mergeGql(schemas) {
  return mergeTypeDefs(schemas);
}

/**
 *
 * @param {DocumentNode} schemaDocumentNode
 * @returns {Promise<string>}
 */
async function extractSchemaString(schemaDocumentNode) {
  return print(schemaDocumentNode);
}

const pluckSchema = asyncFlow(
  getFilepaths,
  asyncMap(getContent),
  asyncMap(pluckGQL),
  asyncFilter(Boolean),
  mergeGql,
  extractSchemaString
);

module.exports = pluckSchema;
