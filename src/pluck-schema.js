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

// https://github.com/apollographql/federation/issues/1875
async function handleQueryQueryFederation2Bug(schema) {
  return schema.replace('query: Query', '');
}

async function removeEmptySchemaContent(schema) {
  const lines = schema.match(/[^\r\n]+/g);

  const schemaTokenIndex = lines.findIndex((line) => line.includes('schema {'));
  const schemaContentEmpty =
    schemaTokenIndex !== -1 &&
    lines[schemaTokenIndex + 1].trim() === '' &&
    lines[schemaTokenIndex + 2].trim() === '}';
  if (schemaContentEmpty) {
    lines.splice(schemaTokenIndex, 3);
    return lines.join('\n');
  }

  const fed2SchemaTokenIndex = lines.findIndex((line) => line.includes('extend schema @link('));
  const fed2SchemaContentEmpty =
    fed2SchemaTokenIndex !== -1 &&
    lines[fed2SchemaTokenIndex + 1].trim() === '' &&
    lines[fed2SchemaTokenIndex + 2].trim() === '}';
  if (fed2SchemaContentEmpty) {
    lines.splice(fed2SchemaTokenIndex + 1, 2);
    return lines
      .map((line, i) => {
        if (i === fed2SchemaTokenIndex) {
          return line.replace('{', '');
        }
        return line;
      })
      .join('\n');
  }
  return schema;
}

const pluckSchema = flow(
  getFilepaths,
  map(getContent),
  map(pluckGQL),
  filter(Boolean),
  mergeGql,
  extractSchemaString,
  handleQueryQueryFederation2Bug,
  removeEmptySchemaContent
);

module.exports = pluckSchema;
