import test from 'node:test';
import assert from 'node:assert/strict';
import { FEED_LIMITS, readBoundedJsonResponse, validateFeedSnapshot, validateFeedSourceUrl, validateHealthSourceUrl } from '../services/feedContract.mjs';

const NOW = Date.parse('2026-08-02T00:00:00+09:00');
const product = {
  id: 'product-1', nameEn: 'Stone Bowl', nameKr: '뚝배기', description: 'Audited product.',
  priceUsd: 20, priceKr: 25000,
  priceVerifiedAt: '2026-08-01T14:45:00.000Z',
  sourceUrl: 'https://docs.google.com/spreadsheets/d/approved',
  category: 'tool',
  links: { global: 'https://www.amazon.com/s?k=stone+bowl', kr: 'https://www.coupang.com/np/search?q=뚝배기' },
  image: 'https://images.unsplash.com/photo-1',
};
const snapshot = {
  source_id: 'QUEENS_KFOOD_001',
  source_updated_at: '2026-08-01T14:50:00.000Z',
  posts: [{
    id: 'post-1', title: 'Verified food', description: 'Verified description.',
    imageUrl: 'https://images.unsplash.com/photo-2', likes: 0, createdAt: Date.parse('2026-08-01T14:40:00.000Z'),
    author: { id: 'author-1', name: 'Editor', avatar: 'https://images.unsplash.com/photo-3', country: 'KR' },
    tags: [{ id: 'tag-1', x: 50, y: 50, product }],
  }],
};

const healthProfile = {
  ingredientId: 'ING-CHICKEN-001',
  reviewedAt: '2026-08-01T12:00:00.000Z',
  nutrition: [{
    layer: 'NUTRITION', status: 'VERIFIED', evidenceLevel: 'OFFICIAL_NUTRITION',
    summary: 'Official nutrition values are shown as nutrition data, not as treatment claims.',
    sourceUrl: 'https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/foodnutrient/searchNutrient.do',
    sourceDate: '2026-08-01T00:00:00.000Z',
  }],
  traditionalUse: [{
    layer: 'TRADITIONAL_USE', status: 'VERIFIED', evidenceLevel: 'TRADITIONAL_REFERENCE',
    summary: 'Traditional-use information remains labeled as traditional use.',
    sourceUrl: 'https://docs.google.com/document/d/traditional-source',
  }],
  modernEvidence: [{
    layer: 'MODERN_EVIDENCE', status: 'PENDING', evidenceLevel: 'PENDING',
    summary: 'Modern clinical benefit is pending evidence review.',
  }],
  safety: [{
    layer: 'SAFETY', status: 'VERIFIED', evidenceLevel: 'SAFETY_ALERT',
    summary: 'Safety signals are displayed before benefits when present.',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3412241/',
  }],
};

const ingredientProduct = {
  ...product,
  id: 'ingredient-1',
  nameEn: 'Chicken',
  nameKr: '닭고기',
  category: 'ingredient',
  healthProfile,
};

const withProduct = (nextProduct) => ({
  ...snapshot,
  posts: [{
    ...snapshot.posts[0],
    tags: [{ ...snapshot.posts[0].tags[0], product: nextProduct }],
  }],
});

test('accepts one fresh audited post and attaches lineage', () => {
  const result = validateFeedSnapshot(snapshot, NOW);
  assert.equal(result.posts.length, 1);
  assert.equal(result.posts[0].sourceId, 'QUEENS_KFOOD_001');
});

test('accepts four-layer ingredient health seed and preserves separation', () => {
  const result = validateFeedSnapshot(withProduct(ingredientProduct), NOW);
  const profile = result.posts[0].tags[0].product.healthProfile;
  assert.equal(profile.nutrition[0].layer, 'NUTRITION');
  assert.equal(profile.traditionalUse[0].layer, 'TRADITIONAL_USE');
  assert.equal(profile.modernEvidence[0].status, 'PENDING');
  assert.equal(profile.safety[0].evidenceLevel, 'SAFETY_ALERT');
  assert.equal(FEED_LIMITS.maxHealthClaimsPerLayer, 5);
});

test('rejects health data on non-ingredient products', () => {
  assert.throws(() => validateFeedSnapshot(withProduct({ ...product, healthProfile }), NOW), /INVALID_HEALTH_TARGET/);
});

test('rejects layer promotion, unsafe health sources, and unverified non-pending evidence', () => {
  const promoted = {
    ...ingredientProduct,
    healthProfile: {
      ...healthProfile,
      traditionalUse: [{ ...healthProfile.traditionalUse[0], layer: 'MODERN_EVIDENCE' }],
    },
  };
  assert.throws(() => validateFeedSnapshot(withProduct(promoted), NOW), /INVALID_HEALTH_LAYER/);

  const unsafe = {
    ...ingredientProduct,
    healthProfile: {
      ...healthProfile,
      safety: [{ ...healthProfile.safety[0], sourceUrl: 'https://evil.example/claim' }],
    },
  };
  assert.throws(() => validateFeedSnapshot(withProduct(unsafe), NOW), /UNSAFE_FEED_URL/);

  const unsupported = {
    ...ingredientProduct,
    healthProfile: {
      ...healthProfile,
      modernEvidence: [{ ...healthProfile.modernEvidence[0], status: 'UNKNOWN', evidenceLevel: 'CLINICAL_STUDY' }],
    },
  };
  assert.throws(() => validateFeedSnapshot(withProduct(unsupported), NOW), /HEALTH_PENDING_EVIDENCE_REQUIRED/);
});

test('accepts approved health evidence source hosts', () => {
  assert.match(validateHealthSourceUrl('https://pubmed.ncbi.nlm.nih.gov/12345678/'), /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//);
  assert.match(validateHealthSourceUrl('https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/foodnutrient/searchNutrient.do'), /^https:\/\/www\.foodsafetykorea\.go\.kr\//);
});

test('rejects stale, future and duplicate post data', () => {
  assert.throws(() => validateFeedSnapshot({ ...snapshot, source_updated_at: '2026-07-20T00:00:00Z' }, NOW), /STALE_OR_FUTURE/);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, source_updated_at: '2026-08-03T00:00:00Z' }, NOW), /STALE_OR_FUTURE/);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: [snapshot.posts[0], snapshot.posts[0]] }, NOW), /DUPLICATE_POST_ID/);
});

test('rejects unsafe source, image and affiliate hosts', () => {
  assert.throws(() => validateFeedSourceUrl('https://evil.example/feed.json'), /UNSAFE_FEED_URL/);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: [{ ...snapshot.posts[0], imageUrl: 'https://evil.example/a.jpg' }] }, NOW), /UNSAFE_FEED_URL/);
  const badProduct = { ...product, links: { ...product.links, global: 'https://evil.example/buy' } };
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: [{ ...snapshot.posts[0], tags: [{ ...snapshot.posts[0].tags[0], product: badProduct }] }] }, NOW), /UNSAFE_FEED_URL/);
});

test('enforces bounded posts, tags and numeric coordinates', () => {
  assert.equal(FEED_LIMITS.maxPosts, 50);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: Array.from({ length: 51 }, (_, i) => ({ ...snapshot.posts[0], id: `p-${i}` })) }, NOW), /POST_COUNT/);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: [{ ...snapshot.posts[0], tags: Array(6).fill(snapshot.posts[0].tags[0]) }] }, NOW), /tags/);
  assert.throws(() => validateFeedSnapshot({ ...snapshot, posts: [{ ...snapshot.posts[0], tags: [{ ...snapshot.posts[0].tags[0], x: 101 }] }] }, NOW), /tags\[0\]\.x/);
});

test('accepts JSON content and rejects wrong MIME or oversized bodies', async () => {
  const valid = new Response(JSON.stringify(snapshot), { status: 200, headers: { 'content-type': 'application/json' } });
  assert.equal((await readBoundedJsonResponse(valid)).source_id, snapshot.source_id);
  await assert.rejects(readBoundedJsonResponse(new Response('{}', { headers: { 'content-type': 'text/html' } })), /CONTENT_TYPE/);
  await assert.rejects(readBoundedJsonResponse(new Response('{}', { headers: { 'content-type': 'application/json', 'content-length': String(FEED_LIMITS.maxBodyBytes + 1) } })), /TOO_LARGE/);
});
