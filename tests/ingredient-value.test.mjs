import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIngredientValueSnapshot,
  saveIngredientValueSnapshot,
  loadIngredientValueSnapshot,
} from '../services/ingredientValueService.mjs';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
  };
};

const fixture = {
  productId: 'UHTMILK_1L',
  productName: '멸균우유 1L',
  currency: 'KRW',
  unit: 'L',
  purchasePrice: 2400,
  purchaseQuantity: 1,
  measuredYield: 0.8,
  remainingQuantity: 0.25,
  derivedIngredients: ['리코타', '유청', '소스'],
  useCases: ['아침', '파스타', '베이킹'],
  updatedAt: '2026-08-29T16:45:00+09:00',
};

test('VALUE_INGREDIENT_MULTIUSE computes purchase/unit/yield/remainder fields deterministically', () => {
  const value = normalizeIngredientValueSnapshot(fixture);
  assert.equal(value.unitCost, 2400);
  assert.equal(value.usableUnitCost, 3000);
  assert.equal(value.remainingValue, 600);
  assert.equal(value.utilizationRate, 0.8);
  assert.equal(value.reuseCount, 6);
});

test('same fixture save→readback x2 remains idempotent', () => {
  const storage = memoryStorage();
  const firstSaved = saveIngredientValueSnapshot(storage, fixture);
  const firstRead = loadIngredientValueSnapshot(storage, fixture.productId);
  const secondSaved = saveIngredientValueSnapshot(storage, fixture);
  const secondRead = loadIngredientValueSnapshot(storage, fixture.productId);

  assert.deepEqual(firstRead, firstSaved);
  assert.deepEqual(secondRead, secondSaved);
  assert.deepEqual(secondRead, firstRead);
  assert.equal(secondRead.schema, 'VALUE_INGREDIENT_MULTIUSE_V1');
});
