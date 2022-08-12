const fs = require('fs').promises;
const { dirname } = require('path');
const core = require('@actions/core');
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { glob } = require('glob');
const { asyncPipe, asyncMap } = require('fp-async-utils');

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
  return plucked.body;
}

/**
 * @param {string[]} schemas
 * @returns {Promise<string>}
 */
async function mergeGql(schemas) {
  console.log(schemas);
  return mergeTypeDefs(schemas);
}

/**
 *
 * @param {string} schema
 * @returns {Promise<void>}
 */
async function writeSchemaToOutput(schema) {
  const output = core.getInput('output');
  core.info(`Writing to file ${output}`);
  console.log(schema);
  await fs.writeFile(output, schema);
}

async function main() {
  await asyncPipe(
    core.getInput('source'),
    getFilepaths,
    asyncMap(getContent, pluckGQL),
    mergeGql,
    writeSchemaToOutput
  );

  const output = core.getInput('output');

  core.debug(`Setting filepath to ${output}`);
  core.setOutput('filepath', output);

  core.debug(`Setting filedir to ${dirname(output)}`);
  core.setOutput('filedir', dirname(output));
}

main().catch((error) => {
  core.setFailed(error.message);
});
