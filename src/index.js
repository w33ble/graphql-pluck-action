const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');

async function getContents() {
  const source = core.getInput('source');
  const filepath = path.resolve(__dirname, `../${source}`);

  core.debug(`Reading from file ${source}`);

  return fs.readFile(filepath, 'utf8');
}

async function main() {
  const source = core.getInput('source');
  const output = core.getInput('output');

  core.debug(`Reading from ${source}`);

  const content = await getContents();

  core.info(`Created file at ${output}`);
  core.setOutput('filepath', output);

  const [plucked] = await gqlPluckFromCodeString(
    source, // this parameter is required to detect file type
    content
  );

  await fs.writeFile(output, plucked.body);
}

main().catch((error) => {
  core.setFailed(error.message);
});
