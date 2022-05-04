const fs = require('fs').promises;
const { dirname } = require('path');
const core = require('@actions/core');
const { gqlPluckFromCodeString } = require('@graphql-tools/graphql-tag-pluck');

async function getContents() {
  const source = core.getInput('source');
  core.debug(`Reading from file ${source}`);

  return fs.readFile(source, 'utf8');
}

async function writeContents(content) {
  const output = core.getInput('output');
  core.info(`Writing to file ${output}`);

  await fs.writeFile(output, content);
  return output;
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
  core.setOutput('filedir', dirname(output));
}

main().catch((error) => {
  core.setFailed(error.message);
});
