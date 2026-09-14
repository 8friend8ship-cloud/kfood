const DEFAULT_TEMPLATE_VERSION = 'family-budget-v1';

const RECEIPT_HINTS = ['receipt', 'invoice', '영수증', '구매내역', '마트', 'market'];

const cleanText = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
};

const clampServings = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return 4;
  return Math.min(20, Math.max(1, parsed));
};

const uniqueProducts = (tags = []) => {
  const seen = new Set();
  return tags.filter((tag) => {
    const product = tag?.product;
    if (!product) return false;
    const key = cleanText(product.id || product.nameEn || product.nameKr).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function inferSubmissionKind(fileName = '', mimeType = '') {
  const normalizedName = cleanText(fileName).toLowerCase();
  if (RECEIPT_HINTS.some((hint) => normalizedName.includes(hint))) return 'receipt';
  if (mimeType === 'application/pdf') return 'receipt';
  return 'food_photo';
}

export function buildShoppingLinks(name, localizedName = name) {
  const globalTerm = cleanText(name, 'food ingredient');
  const krTerm = cleanText(localizedName, globalTerm);
  return {
    global: `https://www.amazon.com/s?k=${encodeURIComponent(globalTerm)}`,
    kr: `https://www.coupang.com/np/search?q=${encodeURIComponent(krTerm)}`,
    naver: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(krTerm)}`,
  };
}

export function ensureShoppableTags(tags = []) {
  return uniqueProducts(tags).map((tag, index) => {
    const product = tag.product;
    const nameEn = cleanText(product.nameEn, product.nameKr || `Ingredient ${index + 1}`);
    const nameKr = cleanText(product.nameKr, nameEn);
    const generatedLinks = buildShoppingLinks(product.searchKeyword || nameEn, nameKr);

    return {
      ...tag,
      id: cleanText(tag.id, `community-tag-${index + 1}`),
      x: Number.isFinite(tag.x) ? tag.x : 50,
      y: Number.isFinite(tag.y) ? tag.y : 50,
      product: {
        ...product,
        id: cleanText(product.id, `community-product-${index + 1}`),
        nameEn,
        nameKr,
        searchKeyword: cleanText(product.searchKeyword, nameEn),
        description: cleanText(product.description, `${nameKr} 구매용 재료 카드`),
        priceUsd: Number.isFinite(product.priceUsd) ? product.priceUsd : 0,
        priceKr: Number.isFinite(product.priceKr) ? product.priceKr : 0,
        category: product.category || 'ingredient',
        links: {
          global: cleanText(product.links?.global, generatedLinks.global),
          kr: cleanText(product.links?.kr, generatedLinks.kr),
          naver: cleanText(product.links?.naver, generatedLinks.naver),
        },
        image: cleanText(product.image),
      },
    };
  });
}

const getIngredientTags = (tags) => tags.filter((tag) => !['tool', 'tableware'].includes(tag.product.category));

const formatAmount = (amount, currency) => {
  if (!Number.isFinite(amount) || amount <= 0) return '';
  if (currency === 'KRW') return `${Math.round(amount).toLocaleString('ko-KR')}원`;
  if (currency === 'JPY') return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${amount.toLocaleString()} ${currency}`;
};

const inferDishName = (dishName, ingredientTags, sourceKind) => {
  const supplied = cleanText(dishName);
  if (supplied) return supplied;
  const first = ingredientTags[0]?.product;
  if (first) return cleanText(first.nameKr, first.nameEn);
  return sourceKind === 'receipt' ? '장보기 재료로 만드는 가족 식단' : '우리 집 음식';
};

export function buildCommunityTemplateDraft({
  sourceKind = 'food_photo',
  authorName = 'Guest Chef',
  imageUrl = '',
  tags = [],
  dishName = '',
  servings = 4,
  receiptTotal,
  currency = 'KRW',
  storeName = '',
  originalFileName = '',
  now = Date.now(),
  locale = 'ko-KR',
  storageStatus = 'LOCAL_TEST',
} = {}) {
  const safeTags = ensureShoppableTags(tags);
  const ingredientTags = getIngredientTags(safeTags);
  const safeServings = clampServings(servings);
  const finalDishName = inferDishName(dishName, ingredientTags, sourceKind);
  const ingredientNames = ingredientTags.map((tag) => tag.product.nameKr || tag.product.nameEn);
  const costAmount = Number(receiptTotal);
  const hasActualCost = sourceKind === 'receipt' && Number.isFinite(costAmount) && costAmount > 0;
  const formattedCost = formatAmount(hasActualCost ? costAmount : undefined, currency);
  const sourceLabel = sourceKind === 'receipt' ? '영수증 기반' : '음식 사진 기반';
  const verificationStatus = ingredientTags.length > 0 ? 'AUTO_FORMATTED' : 'NEEDS_REVIEW';

  const descriptionLines = [
    `【${sourceLabel} 고객 식탁】`,
    `${finalDishName}을(를) 우리 플랫폼의 가족 식비 템플릿으로 정리했습니다.`,
    `기준 인원: ${safeServings}명`,
    ingredientNames.length > 0 ? `확인된 재료: ${ingredientNames.join(', ')}` : '확인된 재료: 자동 판독 결과를 검수해 주세요.',
    hasActualCost ? `실제 구매금액: ${formattedCost}` : '구매비용: 국가별 장보기 링크에서 확인할 수 있습니다.',
    '아래 재료 카드를 누르면 국가별 구매처로 바로 이동합니다.',
  ];

  const postId = `community-${sourceKind}-${now}`;

  return {
    id: postId,
    title: `${finalDishName} | 고객 식탁`,
    author: {
      id: `community-user-${cleanText(authorName, 'guest').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')}`,
      name: cleanText(authorName, 'Guest Chef'),
      avatar: '',
      country: locale === 'ko-KR' ? 'Korea' : 'Global',
      badge: 'Community',
    },
    imageUrl,
    description: descriptionLines.join('\n'),
    tags: safeTags,
    likes: 0,
    difficulty: 'Easy',
    isRecipe: true,
    createdAt: now,
    communityTemplate: {
      version: DEFAULT_TEMPLATE_VERSION,
      sourceKind,
      sourceLabel,
      dishName: finalDishName,
      servings: safeServings,
      ingredientCount: ingredientTags.length,
      costType: hasActualCost ? 'actual' : 'unverified',
      costAmount: hasActualCost ? costAmount : undefined,
      currency,
      storeName: cleanText(storeName),
      originalFileName: cleanText(originalFileName),
      verificationStatus,
      storageStatus,
      generatedAt: now,
      sections: ['음식 소개', '가족 인원', '재료 목록', '실제 또는 예상비용', '국가별 구매 링크'],
    },
  };
}

export function summarizeCommunityDraft(post) {
  const template = post?.communityTemplate;
  if (!template) return null;
  return {
    title: post.title,
    sourceKind: template.sourceKind,
    dishName: template.dishName,
    servings: template.servings,
    ingredientCount: template.ingredientCount,
    verificationStatus: template.verificationStatus,
    storageStatus: template.storageStatus,
    shoppingLinksReady: Array.isArray(post.tags) && post.tags.every((tag) => Boolean(tag.product?.links?.global && tag.product?.links?.kr)),
  };
}
