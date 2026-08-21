export const KFOOD_TEMPLATE_PACK_VERSION = 'KFOOD_TEMPLATE_PACK_V1_20260821';

const required = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`KFOOD_REQUIRED:${field}`);
  return value.trim();
};

export function buildKfoodT1(seed) {
  const ingredients = Array.isArray(seed.ingredients) ? seed.ingredients.map((v) => required(v, 'ingredients')) : [];
  if (!ingredients.length) throw new Error('KFOOD_REQUIRED:ingredients');
  if (!Array.isArray(seed.products) || !seed.products.length) throw new Error('KFOOD_REQUIRED:products');
  return {
    contract: 'KFOOD_RECIPE_T1_V1',
    templateVersion: KFOOD_TEMPLATE_PACK_VERSION,
    seedId: required(seed.seedId, 'seedId'),
    source: {
      id: required(seed.sourceId, 'sourceId'),
      updatedAt: required(seed.sourceUpdatedAt, 'sourceUpdatedAt'),
      url: required(seed.sourceUrl, 'sourceUrl'),
      rightsStatus: required(seed.rightsStatus, 'rightsStatus'),
    },
    dish: required(seed.dish, 'dish'),
    audience: required(seed.audience, 'audience'),
    ingredients,
    steps: (seed.steps || []).map((v) => required(v, 'steps')),
    storyAngle: required(seed.storyAngle, 'storyAngle'),
    image: {
      url: required(seed.imageUrl, 'imageUrl'),
      alt: required(seed.imageAlt, 'imageAlt'),
      textOverlayAllowed: false,
    },
    products: seed.products,
    commercePolicy: {
      priceSourceRequired: true,
      orderEnabled: false,
      paymentEnabled: false,
      approvalRequired: true,
    },
  };
}

export function buildKfoodT2(t1, now = new Date()) {
  if (!Array.isArray(t1.steps) || !t1.steps.length) throw new Error('KFOOD_REQUIRED:steps');
  const createdAt = now.getTime();
  return {
    contract: 'KFOOD_COMMERCE_FEED_T2_V1',
    source_id: t1.source.id,
    source_updated_at: t1.source.updatedAt,
    posts: [{
      id: `kfood-${t1.seedId}`,
      title: t1.dish,
      description: `${t1.storyAngle}\n\n${t1.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
      imageUrl: t1.image.url,
      author: { id: 'drywriter-kfood', name: 'DryWriter K-Food Editor', avatar: t1.image.url, country: 'KR' },
      likes: 0,
      createdAt,
      tags: t1.products.map((product, index) => ({
        id: `tag-${index + 1}`,
        x: product.x,
        y: product.y,
        product,
      })),
      seedId: t1.seedId,
      rightsStatus: t1.source.rightsStatus,
      cta: '승인된 상품 정보와 판매처를 확인하세요.',
      orderEnabled: false,
      paymentEnabled: false,
      publishStatus: 'WAITING_APPROVAL',
    }],
  };
}

export function validateKfoodT2(value) {
  if (value?.contract !== 'KFOOD_COMMERCE_FEED_T2_V1') throw new Error('KFOOD_CONTRACT');
  const post = value.posts?.[0];
  if (!post?.seedId || !post?.title || !post?.description || !post?.imageUrl || !post?.tags?.length) throw new Error('KFOOD_T2_FIELDS');
  if (post.orderEnabled || post.paymentEnabled || post.publishStatus !== 'WAITING_APPROVAL') throw new Error('KFOOD_SAFETY_GATE');
  for (const tag of post.tags) {
    if (!tag.product?.priceVerifiedAt || !tag.product?.sourceUrl) throw new Error('KFOOD_PRODUCT_PROVENANCE');
  }
  return true;
}

