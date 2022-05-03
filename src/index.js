const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');

async function getContents() {
  const source = core.getInput('source');
  core.debug(`Reading from file ${source}`);

  const filepath = path.resolve(__dirname, `../${source}`);
  return fs.readFile(filepath, 'utf8');
}

async function writeContents(content) {
  const output = core.getInput('output');
  core.info(`Writing to file ${output}`);

  const filepath = path.resolve(__dirname, `../${output}`);
  await fs.writeFile(filepath, content);
  return filepath;
}

async function main() {
  const source = core.getInput('source');

  core.debug(`Reading from ${source}`);

  const content = await getContents();

  const [plucked] = await gqlPluckFromCodeString(
    source, // this parameter is required to detect file type
    content
  );

  const output = await writeContents(plucked.body);
  core.setOutput('filepath', output);
}

main().catch((error) => {
  core.setFailed(error.message);
});
