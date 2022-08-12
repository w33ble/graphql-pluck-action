/* eslint-disable no-undef */
const pluckSchema = require('../src/pluck-schema');

describe('pluck-schema', () => {
  it('works with single files', async () => {
    const result = await pluckSchema('test/schema/schema1.js');
    const includesQuery1 = result.match(/query1/g).length === 1;
    const doesNotIncludeQuery3 = result.match(/query3/g) === null;
    const areQueriesMerged = result.match(/type Query/g).length === 1;
    expect(includesQuery1 && doesNotIncludeQuery3 && areQueriesMerged).toBe(true);
  });
  it('works with globs', async () => {
    const result = await pluckSchema('test/schema/**/*.js');
    const includesQuery1 = result.match(/query1/g).length === 1;
    const includesQuery2 = result.match(/query3/g).length === 1;
    const areQueriesMerged = result.match(/type Query/g).length === 1;
    expect(includesQuery1 && includesQuery2 && areQueriesMerged).toBe(true);
  });

  // https://github.com/apollographql/federation/issues/1875
  it('handles query: Query bug in federation 2', async () => {
    const result = await pluckSchema('test/schema-federation-2/**/*.js');
    const doesNotIncludeQueryQueryInSchema1 = result.match(/query: Query/g) === null;
    expect(doesNotIncludeQueryQueryInSchema1).toBe(true);
  });
});
