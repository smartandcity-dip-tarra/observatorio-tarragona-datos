/**
 * Run: `pnpm exec tsx src/slugifyTypology.test.ts` from the transform package.
 */
import assert from 'node:assert/strict';
import { assertDistinctTypologySlugSources, slugifyTypologyLabel } from './slugifyTypology.js';

assert.equal(slugifyTypologyLabel('Municipios industriales'), 'municipios-industriales');
assert.equal(slugifyTypologyLabel('  Municipios de servicios generales  '), 'municipios-de-servicios-generales');
assert.equal(slugifyTypologyLabel(''), null);
assert.equal(slugifyTypologyLabel('   '), null);

assert.throws(
  () =>
    assertDistinctTypologySlugSources([
      { codigo_ine: '1', label: 'A/B' },
      { codigo_ine: '2', label: 'A-B' },
    ]),
  /slug collision/,
);

assertDistinctTypologySlugSources([
  { codigo_ine: '1', label: 'Same label' },
  { codigo_ine: '2', label: 'Same label' },
]);

console.log('slugifyTypology tests OK');
