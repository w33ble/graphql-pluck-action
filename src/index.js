const fs = require('fs').promises;
const { dirname } = require('path');
const core = require('@actions/core');
const pluckSchema = require('./pluck-schema');

async function main() {
  const source = core.getInput('source');
  const schema = await pluckSchema(source);

  const output = core.getInput('output');
  await fs.writeFile(core.getInput('output'), schema);

  core.debug(`Setting filepath to ${output}`);
  core.setOutput('filepath', output);

  core.debug(`Setting filedir to ${dirname(output)}`);
  core.setOutput('filedir', dirname(output));
}

main().catch((error) => {
  core.setFailed(error.message);
});
