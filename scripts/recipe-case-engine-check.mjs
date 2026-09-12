import assert from 'node:assert/strict';
import { runRecipeCaseEngine } from '../.tmp-case-test/recipeCaseEngine.js';

const fixture = {
  ingredients: [
    { name: '감자', state: 'cooked', qty: 100, unit: 'g' },
    { name: '두부', state: 'raw', qty: 40, unit: 'g' },
    { name: '리코타', state: 'raw', qty: 60, unit: 'g' },
    { name: '대파', state: 'raw', qty: 4, unit: 'g' },
    { name: '꿀', state: 'raw', qty: 4, unit: 'g' },
  ],
  tools: ['blender'],
  timeLimitMinutes: 10,
  servings: 1,
  sourceContext: {
    sourceStatus: 'SOURCE_UNCONFIRMED',
    sourceLabel: 'chef-inspired potato-tofu-ricotta-honey-green-onion concept',
  },
};

const run1 = runRecipeCaseEngine(fixture);
const run2 = runRecipeCaseEngine(fixture);

assert.deepEqual(run1, run2, 'same fixture must be deterministic across x2 runs');
assert.ok(run1.bestCase, 'bestCase must exist');
assert.equal(run1.bestCase.format, 'mousse', 'mousse should rank first for this fixture');
assert.equal(run1.sourceStatus, 'SOURCE_UNCONFIRMED');
assert.equal(run1.bestCase.templatePromotionAllowed, false, 'unverified chef attribution must block template promotion');
assert.equal(run1.testGate, 'SOURCE_VERIFICATION_PENDING');
assert.ok(run1.alternatives.length >= 2, 'must return alternatives');
assert.ok(run1.recoveryPlan.length >= 4, 'must return recovery instructions');
assert.ok(run1.leftoverNextUse.length >= 3, 'must return leftover reuse suggestions');
assert.ok(run1.bestCase.risks.some((risk) => risk.includes('대파')), 'must flag green-onion overdose risk');
assert.ok(run1.bestCase.risks.some((risk) => risk.includes('꿀')), 'must flag honey overdose risk');

console.log(JSON.stringify({
  status: 'PASS_X2',
  bestCase: run1.bestCase.title,
  score: run1.bestCase.score,
  alternatives: run1.alternatives.map((item) => item.title),
  testGate: run1.testGate,
  sourceStatus: run1.sourceStatus,
  recoveryCount: run1.recoveryPlan.length,
  leftoverCount: run1.leftoverNextUse.length,
}, null, 2));
