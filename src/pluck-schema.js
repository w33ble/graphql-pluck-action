const fs = require('fs').promises;
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { glob } = require('glob');
const { asyncMap: map, asyncFilter: filter, asyncFlow: flow } = require('fp-async-utils');
const { print } = require('graphql');

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

async function getContent(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return { filePath, content };
}

async function pluckGQL({ filePath, content }) {
  const [plucked] = await gqlPluckFromCodeString(filePath, content);
  return plucked && plucked.body;
}

async function mergeGql(schemas) {
  return mergeTypeDefs(schemas);
}

async function extractSchemaString(schemaDocumentNode) {
  return print(schemaDocumentNode);
}

const pluckSchema = flow(
  getFilepaths,
  map(getContent),
  map(pluckGQL),
  filter(Boolean),
  mergeGql,
  extractSchemaString
);

module.exports = pluckSchema;
