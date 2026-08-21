import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKfoodT1, buildKfoodT2, validateKfoodT2 } from '../services/kfoodTemplatePack.mjs';

const seed = {
  seedId: 'SEED_KFOOD_BIBIMBAP_001',
  sourceId: 'QUEENS_KFOOD_APPROVED_001',
  sourceUpdatedAt: '2026-08-21T08:00:00.000Z',
  sourceUrl: 'https://docs.google.com/spreadsheets/d/approved',
  rightsStatus: 'VERIFIED',
  dish: '돌솥비빔밥',
  audience: '처음 한식을 만드는 해외 가정',
  ingredients: ['밥', '나물', '고추장', '달걀'],
  steps: ['재료를 각각 익힌다.', '밥 위에 재료를 담는다.', '고추장과 함께 비빈다.'],
  storyAngle: '한 그릇에 색과 식감을 균형 있게 담는 집밥.',
  imageUrl: 'https://images.unsplash.com/photo-1',
  imageAlt: '돌솥에 담긴 비빔밥',
  products: [{
    id: 'gochujang-1', nameEn: 'Gochujang', nameKr: '고추장', description: '승인된 상품 설명',
    priceUsd: 9, priceKr: 12000, priceVerifiedAt: '2026-08-21T08:00:00.000Z', sourceUrl: 'https://docs.google.com/spreadsheets/d/approved',
    category: 'sauce', links: { global: 'https://www.amazon.com/s?k=gochujang', kr: 'https://www.coupang.com/np/search?q=고추장' },
    image: 'https://images.unsplash.com/photo-2', x: 50, y: 50,
  }],
};

test('builds app-specific recipe T1 and commerce T2 with provenance', () => {
  const t1 = buildKfoodT1(seed);
  const t2 = buildKfoodT2(t1, new Date('2026-08-21T08:30:00.000Z'));
  assert.equal(t1.contract, 'KFOOD_RECIPE_T1_V1');
  assert.equal(t2.posts[0].title, '돌솥비빔밥');
  assert.equal(t2.posts[0].tags[0].product.sourceUrl, seed.sourceUrl);
  assert.equal(validateKfoodT2(t2), true);
});

test('keeps order, payment, and publishing closed', () => {
  const post = buildKfoodT2(buildKfoodT1(seed)).posts[0];
  assert.equal(post.orderEnabled, false);
  assert.equal(post.paymentEnabled, false);
  assert.equal(post.publishStatus, 'WAITING_APPROVAL');
});

test('rejects products without current price provenance', () => {
  const broken = structuredClone(seed);
  delete broken.products[0].priceVerifiedAt;
  assert.throws(() => validateKfoodT2(buildKfoodT2(buildKfoodT1(broken))), /PRODUCT_PROVENANCE/);
});

