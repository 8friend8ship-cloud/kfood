import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCommunityTemplateDraft,
  buildShoppingLinks,
  inferSubmissionKind,
  summarizeCommunityDraft,
} from '../services/communityTemplateService.js';
import {
  buildCommunityIngestPayload,
  submitCommunityDraft,
} from '../services/communityIntakeService.js';

const ingredientTag = {
  id: 'tag-1',
  x: 40,
  y: 60,
  product: {
    id: 'prod-tofu',
    nameEn: 'Firm tofu',
    nameKr: '두부',
    searchKeyword: 'firm tofu',
    description: '가족 반찬과 도시락에 활용하는 두부',
    priceUsd: 3.5,
    priceKr: 2500,
    category: 'ingredient',
    links: { global: '', kr: '' },
    image: '',
  },
};

test('infers receipt and food-photo submission kinds', () => {
  assert.equal(inferSubmissionKind('마트_영수증.jpg', 'image/jpeg'), 'receipt');
  assert.equal(inferSubmissionKind('dinner.jpg', 'image/jpeg'), 'food_photo');
});

test('applies the platform template to a customer food photo and makes ingredients shoppable', () => {
  const post = buildCommunityTemplateDraft({
    sourceKind: 'food_photo',
    authorName: '테스트 가족',
    imageUrl: 'data:image/jpeg;base64,TEST',
    tags: [ingredientTag],
    dishName: '두부 채소 덮밥',
    servings: 4,
    now: 1000,
  });

  assert.equal(post.title, '두부 채소 덮밥 | 고객 식탁');
  assert.equal(post.communityTemplate.version, 'family-budget-v1');
  assert.equal(post.communityTemplate.ingredientCount, 1);
  assert.equal(post.communityTemplate.verificationStatus, 'AUTO_FORMATTED');
  assert.match(post.description, /국가별 구매처/);
  assert.match(post.tags[0].product.links.global, /amazon\.com/);
  assert.match(post.tags[0].product.links.kr, /coupang\.com/);
  assert.equal(summarizeCommunityDraft(post).shoppingLinksReady, true);
});

test('uses receipt total as actual cost in the generated platform template', () => {
  const post = buildCommunityTemplateDraft({
    sourceKind: 'receipt',
    authorName: '영수증 참여자',
    imageUrl: 'data:image/jpeg;base64,RECEIPT',
    tags: [ingredientTag],
    receiptTotal: 18700,
    currency: 'KRW',
    storeName: '동네마트',
    now: 2000,
  });

  assert.equal(post.communityTemplate.costType, 'actual');
  assert.equal(post.communityTemplate.costAmount, 18700);
  assert.match(post.description, /18,700원/);
  assert.equal(post.communityTemplate.sourceKind, 'receipt');
});

test('keeps an empty analysis safe and marks it for review', () => {
  const post = buildCommunityTemplateDraft({
    sourceKind: 'food_photo',
    imageUrl: 'data:image/jpeg;base64,EMPTY',
    tags: [],
    now: 3000,
  });

  assert.equal(post.communityTemplate.ingredientCount, 0);
  assert.equal(post.communityTemplate.verificationStatus, 'NEEDS_REVIEW');
});

test('builds a Drive ingest payload and supports local execution-test mode', async () => {
  const post = buildCommunityTemplateDraft({
    sourceKind: 'food_photo',
    imageUrl: 'data:image/jpeg;base64,TEST',
    tags: [ingredientTag],
    now: 4000,
  });

  const payload = buildCommunityIngestPayload(post, 'meal.jpg');
  assert.equal(payload.action, 'COMMUNITY_SUBMISSION');
  assert.equal(payload.originalFileName, 'meal.jpg');

  const result = await submitCommunityDraft({ post, originalFileName: 'meal.jpg' });
  assert.deepEqual(result, {
    ok: true,
    mode: 'LOCAL_TEST',
    status: 'LOCAL_TEST',
    submissionId: post.id,
  });
});

test('shopping-link helper creates global and Korean shopping searches', () => {
  const links = buildShoppingLinks('firm tofu', '두부');
  assert.match(links.global, /firm%20tofu/);
  assert.match(links.kr, /%EB%91%90%EB%B6%80/);
  assert.match(links.naver, /shopping\.naver\.com/);
});
