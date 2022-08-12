/* eslint-disable no-undef */
const pluckSchema = require('../src/pluck-schema');

describe('pluck-schema', () => {
  it('should work', async () => {
    const result = await pluckSchema('test/schema/**/*.js');
    const areQueriesMerged = result.match(/type Query/g).length === 1;
    expect(areQueriesMerged).toBe(true);
  });
});
