import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const vite = read('vite.config.ts');
const gemini = read('services/geminiService.ts');
const firebase = read('services/firebaseService.ts');
const budget = read('tests/bundle-budget.mjs');

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

test('repository declares executable test and bundle budget commands', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  assert.equal(pkg.scripts['bundle:check'], 'node tests/bundle-budget.mjs');
});

test('production build separates large dependency groups', () => {
  for (const chunk of ['react-vendor', 'icons-vendor', 'firebase-auth', 'firebase-firestore', 'firebase-functions', 'firebase-storage', 'firebase-core']) {
    assert.match(vite, new RegExp(chunk));
  }
  assert.match(vite, /manualChunks/);
});

test('bundle budget fails files larger than 500 KiB', () => {
  assert.match(budget, /500\s*\*\s*1024/);
  assert.match(budget, /process\.exitCode\s*=\s*1/);
});
