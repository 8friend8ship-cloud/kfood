export const INGREDIENT_VALUE_SCHEMA = 'VALUE_INGREDIENT_MULTIUSE_V1';

const finite = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const uniq = (values = []) => [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))];

export const normalizeIngredientValueSnapshot = (input = {}) => {
  const purchasePrice = finite(input.purchasePrice);
  const purchaseQuantity = Math.max(finite(input.purchaseQuantity, 1), 0.000001);
  const measuredYield = Math.max(finite(input.measuredYield, purchaseQuantity), 0.000001);
  const remainingQuantity = Math.min(finite(input.remainingQuantity), purchaseQuantity);
  const derivedIngredients = uniq(input.derivedIngredients);
  const useCases = uniq(input.useCases);
  const unitCost = purchasePrice / purchaseQuantity;
  const usableUnitCost = purchasePrice / measuredYield;
  const remainingValue = unitCost * remainingQuantity;
  const utilizationRate = Math.min(measuredYield / purchaseQuantity, 1);
  const reuseCount = derivedIngredients.length + useCases.length;

  return {
    schema: INGREDIENT_VALUE_SCHEMA,
    productId: String(input.productId || ''),
    productName: String(input.productName || ''),
    currency: String(input.currency || 'KRW'),
    unit: String(input.unit || 'unit'),
    purchasePrice,
    purchaseQuantity,
    measuredYield,
    remainingQuantity,
    derivedIngredients,
    useCases,
    unitCost,
    usableUnitCost,
    remainingValue,
    utilizationRate,
    reuseCount,
    updatedAt: String(input.updatedAt || new Date().toISOString()),
  };
};

export const buildIngredientValueKey = (productId) => `kfood:ingredient-value:${String(productId || '').trim()}`;

export const saveIngredientValueSnapshot = (storage, input) => {
  if (!storage || typeof storage.setItem !== 'function') throw new Error('STORAGE_REQUIRED');
  const normalized = normalizeIngredientValueSnapshot(input);
  if (!normalized.productId) throw new Error('PRODUCT_ID_REQUIRED');
  storage.setItem(buildIngredientValueKey(normalized.productId), JSON.stringify(normalized));
  return normalized;
};

export const loadIngredientValueSnapshot = (storage, productId) => {
  if (!storage || typeof storage.getItem !== 'function') return null;
  const raw = storage.getItem(buildIngredientValueKey(productId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.schema !== INGREDIENT_VALUE_SCHEMA || parsed?.productId !== String(productId)) return null;
    return normalizeIngredientValueSnapshot(parsed);
  } catch {
    return null;
  }
};

export const createDefaultIngredientValueSnapshot = (product, region = 'KR') => normalizeIngredientValueSnapshot({
  productId: product?.id,
  productName: region === 'KR' ? product?.nameKr : product?.nameEn,
  currency: region === 'KR' ? 'KRW' : 'USD',
  purchasePrice: region === 'KR' ? product?.priceKr : product?.priceUsd,
  purchaseQuantity: 1,
  measuredYield: 1,
  remainingQuantity: 0,
  unit: 'pack',
  derivedIngredients: product?.productTags || [],
  useCases: product?.category === 'ingredient' ? ['main dish', 'side dish', 'leftover reuse'] : [product?.category || 'general'],
});
