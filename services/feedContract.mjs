const MAX_BODY_BYTES = 512 * 1024;
const MAX_POSTS = 50;
const MAX_TAGS_PER_POST = 5;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const MAX_HEALTH_CLAIMS_PER_LAYER = 5;

const SOURCE_HOSTS = new Set([
  'docs.google.com',
  'drive.google.com',
  'drive.usercontent.google.com',
  'script.google.com',
  'script.googleusercontent.com',
  'sheets.googleapis.com',
]);

const HEALTH_SOURCE_HOSTS = new Set([
  ...SOURCE_HOSTS,
  'foodsafetykorea.go.kr',
  'www.foodsafetykorea.go.kr',
  'pubmed.ncbi.nlm.nih.gov',
  'www.ncbi.nlm.nih.gov',
  'pmc.ncbi.nlm.nih.gov',
]);

const IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'drive.google.com',
  'drive.usercontent.google.com',
  'lh3.googleusercontent.com',
  'storage.googleapis.com',
]);

const PRODUCT_HOSTS = new Set([
  'amazon.com',
  'www.amazon.com',
  'amzn.to',
  'coupang.com',
  'www.coupang.com',
]);

const CATEGORIES = new Set(['tool', 'ingredient', 'tableware', 'snack', 'sauce', 'kit', 'drink']);
const HEALTH_LAYERS = Object.freeze(['NUTRITION', 'TRADITIONAL_USE', 'MODERN_EVIDENCE', 'SAFETY']);
const HEALTH_STATUSES = new Set(['VERIFIED', 'PENDING', 'UNKNOWN']);
const HEALTH_EVIDENCE_LEVELS = new Set([
  'OFFICIAL_NUTRITION',
  'TRADITIONAL_REFERENCE',
  'SYSTEMATIC_REVIEW',
  'CLINICAL_STUDY',
  'OBSERVATIONAL',
  'CASE_REPORT',
  'SAFETY_ALERT',
  'PENDING',
]);

const requiredString = (value, field, maxLength = 500) => {
  if (typeof value !== 'string' || value.trim() === '' || value.length > maxLength) {
    throw new Error(`INVALID_FEED_FIELD:${field}`);
  }
  return value.trim();
};

const boundedNumber = (value, field, min, max) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`INVALID_FEED_FIELD:${field}`);
  }
  return value;
};

const safeUrl = (value, field, hosts) => {
  const url = new URL(requiredString(value, field, 2048));
  if (url.protocol !== 'https:' || url.username || url.password || !hosts.has(url.hostname.toLowerCase())) {
    throw new Error(`UNSAFE_FEED_URL:${field}`);
  }
  return url.toString();
};

const optionalSafeUrl = (value, field, hosts) => {
  if (value === undefined || value === null || value === '') return undefined;
  return safeUrl(value, field, hosts);
};

const validPastIso = (value, field, now = Date.now()) => {
  const text = requiredString(value, field, 80);
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed) || parsed > now + 5 * 60 * 1000) {
    throw new Error(`INVALID_FEED_FIELD:${field}`);
  }
  return new Date(parsed).toISOString();
};

export const validateFeedSourceUrl = (value) => safeUrl(value, 'source_url', SOURCE_HOSTS);
export const validateHealthSourceUrl = (value) => safeUrl(value, 'health_source_url', HEALTH_SOURCE_HOSTS);

const validateHealthClaim = (value, path, expectedLayer, now) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`INVALID_FEED_FIELD:${path}`);
  }
  const layer = requiredString(value.layer, `${path}.layer`, 40);
  if (layer !== expectedLayer) throw new Error(`INVALID_HEALTH_LAYER:${path}.layer`);

  const status = requiredString(value.status, `${path}.status`, 20);
  if (!HEALTH_STATUSES.has(status)) throw new Error(`INVALID_HEALTH_STATUS:${path}.status`);

  const evidenceLevel = requiredString(value.evidenceLevel, `${path}.evidenceLevel`, 40);
  if (!HEALTH_EVIDENCE_LEVELS.has(evidenceLevel)) {
    throw new Error(`INVALID_HEALTH_EVIDENCE_LEVEL:${path}.evidenceLevel`);
  }

  const sourceUrl = optionalSafeUrl(value.sourceUrl, `${path}.sourceUrl`, HEALTH_SOURCE_HOSTS);
  if (status === 'VERIFIED' && !sourceUrl) throw new Error(`HEALTH_SOURCE_REQUIRED:${path}.sourceUrl`);
  if (status !== 'VERIFIED' && evidenceLevel !== 'PENDING') {
    throw new Error(`HEALTH_PENDING_EVIDENCE_REQUIRED:${path}.evidenceLevel`);
  }

  return {
    layer,
    status,
    evidenceLevel,
    summary: requiredString(value.summary, `${path}.summary`, 700),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(value.sourceDate ? { sourceDate: validPastIso(value.sourceDate, `${path}.sourceDate`, now) } : {}),
  };
};

const validateHealthLayer = (value, path, expectedLayer, now) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_HEALTH_CLAIMS_PER_LAYER) {
    throw new Error(`INVALID_FEED_FIELD:${path}`);
  }
  return value.map((claim, index) => validateHealthClaim(claim, `${path}[${index}]`, expectedLayer, now));
};

const validateHealthProfile = (value, path, now) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`INVALID_FEED_FIELD:${path}`);
  const nutrition = validateHealthLayer(value.nutrition, `${path}.nutrition`, 'NUTRITION', now);
  const traditionalUse = validateHealthLayer(value.traditionalUse, `${path}.traditionalUse`, 'TRADITIONAL_USE', now);
  const modernEvidence = validateHealthLayer(value.modernEvidence, `${path}.modernEvidence`, 'MODERN_EVIDENCE', now);
  const safety = validateHealthLayer(value.safety, `${path}.safety`, 'SAFETY', now);
  if (nutrition.length + traditionalUse.length + modernEvidence.length + safety.length === 0) {
    throw new Error(`INVALID_FEED_FIELD:${path}.empty`);
  }
  return {
    ingredientId: requiredString(value.ingredientId, `${path}.ingredientId`, 160),
    reviewedAt: validPastIso(value.reviewedAt, `${path}.reviewedAt`, now),
    nutrition,
    traditionalUse,
    modernEvidence,
    safety,
  };
};

const validateProduct = (value, path, now) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`INVALID_FEED_FIELD:${path}`);
  const category = requiredString(value.category, `${path}.category`, 30);
  if (!CATEGORIES.has(category)) throw new Error(`INVALID_FEED_FIELD:${path}.category`);
  if (value.healthProfile !== undefined && category !== 'ingredient') {
    throw new Error(`INVALID_HEALTH_TARGET:${path}.healthProfile`);
  }

  return {
    id: requiredString(value.id, `${path}.id`, 120),
    nameEn: requiredString(value.nameEn, `${path}.nameEn`, 160),
    nameKr: requiredString(value.nameKr, `${path}.nameKr`, 160),
    description: requiredString(value.description, `${path}.description`, 1200),
    priceUsd: boundedNumber(value.priceUsd, `${path}.priceUsd`, 0, 1_000_000),
    priceKr: boundedNumber(value.priceKr, `${path}.priceKr`, 0, 1_000_000_000),
    priceVerifiedAt: requiredString(value.priceVerifiedAt, `${path}.priceVerifiedAt`, 80),
    sourceUrl: validateFeedSourceUrl(value.sourceUrl),
    category,
    links: {
      global: safeUrl(value.links?.global, `${path}.links.global`, PRODUCT_HOSTS),
      kr: safeUrl(value.links?.kr, `${path}.links.kr`, PRODUCT_HOSTS),
    },
    image: safeUrl(value.image, `${path}.image`, IMAGE_HOSTS),
    ...(typeof value.searchKeyword === 'string' && value.searchKeyword.trim()
      ? { searchKeyword: requiredString(value.searchKeyword, `${path}.searchKeyword`, 240) }
      : {}),
    ...(Array.isArray(value.productTags)
      ? { productTags: value.productTags.slice(0, 10).map((tag, index) => requiredString(tag, `${path}.productTags[${index}]`, 80)) }
      : {}),
    ...(value.healthProfile !== undefined
      ? { healthProfile: validateHealthProfile(value.healthProfile, `${path}.healthProfile`, now) }
      : {}),
  };
};

const validatePost = (value, index, sourceId, updatedAtMs, now) => {
  const path = `posts[${index}]`;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`INVALID_FEED_FIELD:${path}`);
  if (!Array.isArray(value.tags) || value.tags.length < 1 || value.tags.length > MAX_TAGS_PER_POST) {
    throw new Error(`INVALID_FEED_FIELD:${path}.tags`);
  }

  return {
    id: requiredString(value.id, `${path}.id`, 120),
    title: requiredString(value.title, `${path}.title`, 240),
    description: requiredString(value.description, `${path}.description`, 4000),
    imageUrl: safeUrl(value.imageUrl, `${path}.imageUrl`, IMAGE_HOSTS),
    author: {
      id: requiredString(value.author?.id, `${path}.author.id`, 120),
      name: requiredString(value.author?.name, `${path}.author.name`, 120),
      avatar: safeUrl(value.author?.avatar, `${path}.author.avatar`, IMAGE_HOSTS),
      ...(typeof value.author?.country === 'string' && value.author.country.trim()
        ? { country: requiredString(value.author.country, `${path}.author.country`, 80) }
        : {}),
    },
    likes: boundedNumber(value.likes, `${path}.likes`, 0, 1_000_000_000),
    createdAt: boundedNumber(value.createdAt, `${path}.createdAt`, 0, updatedAtMs),
    tags: value.tags.map((tag, tagIndex) => ({
      id: requiredString(tag?.id, `${path}.tags[${tagIndex}].id`, 120),
      x: boundedNumber(tag?.x, `${path}.tags[${tagIndex}].x`, 0, 100),
      y: boundedNumber(tag?.y, `${path}.tags[${tagIndex}].y`, 0, 100),
      product: validateProduct(tag?.product, `${path}.tags[${tagIndex}].product`, now),
    })),
    sourceId,
    sourceUpdatedAt: new Date(updatedAtMs).toISOString(),
  };
};

export const validateFeedSnapshot = (value, now = Date.now()) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_FEED');
  const sourceId = requiredString(value.source_id, 'source_id', 160);
  const updatedAtMs = Date.parse(requiredString(value.source_updated_at, 'source_updated_at', 80));
  if (!Number.isFinite(updatedAtMs) || updatedAtMs > now + 5 * 60 * 1000 || now - updatedAtMs > MAX_AGE_MS) {
    throw new Error('STALE_OR_FUTURE_FEED');
  }
  if (!Array.isArray(value.posts) || value.posts.length < 1 || value.posts.length > MAX_POSTS) {
    throw new Error('INVALID_FEED_POST_COUNT');
  }

  const posts = value.posts.map((post, index) => validatePost(post, index, sourceId, updatedAtMs, now));
  if (new Set(posts.map((post) => post.id)).size !== posts.length) throw new Error('DUPLICATE_POST_ID');

  return {
    source_id: sourceId,
    source_updated_at: new Date(updatedAtMs).toISOString(),
    posts,
  };
};

export const readBoundedJsonResponse = async (response) => {
  if (!response.ok) throw new Error(`FEED_HTTP_${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!/^application\/(?:[a-z0-9.+-]*\+)?json(?:\s*;|$)/i.test(contentType)) throw new Error('FEED_CONTENT_TYPE');
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) throw new Error('FEED_BODY_TOO_LARGE');
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) throw new Error('FEED_BODY_TOO_LARGE');
  return JSON.parse(body);
};

export const FEED_LIMITS = Object.freeze({
  maxBodyBytes: MAX_BODY_BYTES,
  maxPosts: MAX_POSTS,
  maxTagsPerPost: MAX_TAGS_PER_POST,
  maxAgeMs: MAX_AGE_MS,
  maxHealthClaimsPerLayer: MAX_HEALTH_CLAIMS_PER_LAYER,
});
