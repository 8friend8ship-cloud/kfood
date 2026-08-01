import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const vite = read('vite.config.ts');
const gemini = read('services/geminiService.ts');
const firebase = read('services/firebaseService.ts');

test('browser build does not inject Gemini secrets', () => {
  assert.doesNotMatch(vite, /GEMINI_API_KEY|process\.env\.API_KEY|define\s*:/);
});

test('browser Gemini adapter never reads a secret', () => {
  assert.doesNotMatch(gemini, /process\.env|GEMINI_API_KEY|GoogleGenAI/);
});

test('missing backend fails closed instead of returning mock success', () => {
  assert.match(firebase, /BACKEND_UNAVAILABLE/);
  assert.doesNotMatch(firebase, /return\s+Promise\.resolve\(mockResponse\)/);
  assert.doesNotMatch(firebase, /Returning mock response/);
});

test('financial operations remain behind callable backend functions', () => {
  for (const name of [
    'setupPhonePayout',
    'smartPayout',
    'redeemPaymentCode',
    'purchaseCreditsWithStripe',
    'rechargeToTossAccount',
    'setupAutoRecharge'
  ]) {
    assert.match(firebase, new RegExp(`export const ${name}[^]*callFirebaseFunction\\(`));
  }
});

test('public source contains no settlement account or unsafe backend guide', () => {
  assert.doesNotMatch(firebase, /1002[- ]?4139[- ]?7284|YOUR_TOSS_ACCOUNT|BACKEND IMPLEMENTATION GUIDE/);
});

test('repository declares an executable test command', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
});
