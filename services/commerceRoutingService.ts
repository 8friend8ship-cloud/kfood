import { Product, Region } from '../types';

export type MarketplaceId = 'COUPANG' | 'ALIEXPRESS' | 'AMAZON' | 'LOCAL_MAP';
export type DeliveryStatus = 'DELIVERABLE' | 'NOT_DELIVERABLE' | 'UNKNOWN';

export interface VisitorCommerceContext {
  countryCode: string;
  latitude?: number;
  longitude?: number;
  locationPrecision: 'PRECISE' | 'COUNTRY_ONLY';
  source: 'BROWSER_GEOLOCATION' | 'REGION_SETTING' | 'BROWSER_LOCALE';
}

export interface CommerceOffer {
  provider: MarketplaceId;
  label: string;
  title: string;
  url: string;
  affiliate: boolean;
  currency?: string;
  itemPrice?: number;
  shippingPrice?: number;
  totalPrice?: number;
  unitQuantity?: number;
  unitLabel?: string;
  unitCost?: number;
  deliveryStatus: DeliveryStatus;
  deliveryEta?: string;
  priceVerifiedAt?: string;
  deliveryVerifiedAt?: string;
  evidence?: string;
  live: boolean;
}

export interface CommerceComparisonResult {
  context: VisitorCommerceContext;
  offers: CommerceOffer[];
  recommendedProvider?: MarketplaceId;
  recommendationReason?: string;
  runtimeStatus: 'LIVE_PARTIAL' | 'FALLBACK_ONLY';
}

const countryFromLocale = (): string => {
  const locale = navigator.language || 'en-US';
  const match = locale.match(/[-_]([A-Z]{2})$/i);
  return match ? match[1].toUpperCase() : 'US';
};

const getGrantedGeolocation = async (): Promise<GeolocationPosition | null> => {
  if (!('geolocation' in navigator)) return null;
  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (permission.state !== 'granted') return null;
    }
  } catch {
    // Permission API is not universal. Avoid prompting automatically.
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: false,
      timeout: 4000,
      maximumAge: 15 * 60 * 1000,
    });
  });
};

export const requestPreciseVisitorLocation = (): Promise<GeolocationPosition | null> => {
  if (!('geolocation' in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 10 * 60 * 1000,
    });
  });
};

export const resolveVisitorCommerceContext = async (region: Region): Promise<VisitorCommerceContext> => {
  const grantedPosition = await getGrantedGeolocation();
  const countryCode = region === Region.KR ? 'KR' : countryFromLocale();

  if (grantedPosition) {
    return {
      countryCode,
      latitude: grantedPosition.coords.latitude,
      longitude: grantedPosition.coords.longitude,
      locationPrecision: 'PRECISE',
      source: 'BROWSER_GEOLOCATION',
    };
  }

  return {
    countryCode,
    locationPrecision: 'COUNTRY_ONLY',
    source: region === Region.KR ? 'REGION_SETTING' : 'BROWSER_LOCALE',
  };
};

const mapsSearchUrl = (product: Product, context: VisitorCommerceContext) => {
  const q = encodeURIComponent(`${product.nameKr || product.nameEn} 식재료 마트`);
  if (context.latitude != null && context.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${q}&center=${context.latitude},${context.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
};

const aliSearchUrl = (product: Product) =>
  `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.searchKeyword || product.nameEn)}`;

const fallbackOffers = (product: Product, context: VisitorCommerceContext): CommerceOffer[] => {
  const result: CommerceOffer[] = [];

  if (product.links.kr) {
    result.push({
      provider: 'COUPANG',
      label: 'Coupang',
      title: product.nameKr || product.nameEn,
      url: product.links.kr,
      affiliate: true,
      currency: 'KRW',
      itemPrice: product.priceKr || undefined,
      totalPrice: product.priceKr || undefined,
      deliveryStatus: 'UNKNOWN',
      evidence: 'Stored product link/price. Delivery must be verified at runtime.',
      live: false,
    });
  }

  if (product.links.global) {
    result.push({
      provider: 'AMAZON',
      label: 'Amazon',
      title: product.nameEn,
      url: product.links.global,
      affiliate: true,
      currency: 'USD',
      itemPrice: product.priceUsd || undefined,
      totalPrice: product.priceUsd || undefined,
      deliveryStatus: 'UNKNOWN',
      evidence: 'Stored product link/price. Exact destination delivery is not inferred.',
      live: false,
    });
  }

  result.push({
    provider: 'ALIEXPRESS',
    label: 'AliExpress',
    title: `${product.nameEn} search`,
    url: aliSearchUrl(product),
    affiliate: false,
    deliveryStatus: 'UNKNOWN',
    evidence: 'Search fallback only until an approved affiliate deep link/API result is available.',
    live: false,
  });

  result.push({
    provider: 'LOCAL_MAP',
    label: 'Nearby stores',
    title: `Find ${product.nameKr || product.nameEn} nearby`,
    url: mapsSearchUrl(product, context),
    affiliate: false,
    deliveryStatus: 'UNKNOWN',
    evidence: context.locationPrecision === 'PRECISE'
      ? 'Map search centered on browser-granted location.'
      : 'Map search uses visitor locale until precise location is granted.',
    live: false,
  });

  return result;
};

const normalizeOffer = (raw: Partial<CommerceOffer>): CommerceOffer | null => {
  if (!raw.provider || !raw.url || !raw.title) return null;
  const item = Number.isFinite(raw.itemPrice) ? Number(raw.itemPrice) : undefined;
  const shipping = Number.isFinite(raw.shippingPrice) ? Number(raw.shippingPrice) : undefined;
  const total = Number.isFinite(raw.totalPrice)
    ? Number(raw.totalPrice)
    : item != null
      ? item + (shipping || 0)
      : undefined;
  const qty = Number.isFinite(raw.unitQuantity) && Number(raw.unitQuantity) > 0 ? Number(raw.unitQuantity) : undefined;

  return {
    provider: raw.provider,
    label: raw.label || raw.provider,
    title: raw.title,
    url: raw.url,
    affiliate: Boolean(raw.affiliate),
    currency: raw.currency,
    itemPrice: item,
    shippingPrice: shipping,
    totalPrice: total,
    unitQuantity: qty,
    unitLabel: raw.unitLabel,
    unitCost: total != null && qty ? total / qty : raw.unitCost,
    deliveryStatus: raw.deliveryStatus || 'UNKNOWN',
    deliveryEta: raw.deliveryEta,
    priceVerifiedAt: raw.priceVerifiedAt,
    deliveryVerifiedAt: raw.deliveryVerifiedAt,
    evidence: raw.evidence,
    live: Boolean(raw.live),
  };
};

const mergeOffers = (live: CommerceOffer[], fallback: CommerceOffer[]) => {
  const map = new Map<MarketplaceId, CommerceOffer>();
  for (const offer of fallback) map.set(offer.provider, offer);
  for (const offer of live) map.set(offer.provider, offer);
  return [...map.values()];
};

const recommend = (offers: CommerceOffer[]) => {
  const eligible = offers
    .filter((o) => o.live && o.deliveryStatus === 'DELIVERABLE' && o.totalPrice != null)
    .map((o) => ({
      ...o,
      comparableCost: o.unitCost ?? o.totalPrice!,
    }))
    .sort((a, b) => a.comparableCost - b.comparableCost);

  if (!eligible.length) return {};
  const best = eligible[0];
  return {
    recommendedProvider: best.provider,
    recommendationReason: best.unitCost != null
      ? `Verified delivered unit cost is lowest (${best.currency || ''} ${best.unitCost.toFixed(2)}${best.unitLabel ? `/${best.unitLabel}` : ''}).`
      : `Verified delivered total is lowest (${best.currency || ''} ${best.totalPrice?.toFixed(2)}).`,
  };
};

export const compareMarketplaceOffers = async (
  product: Product,
  region: Region,
  forcedPosition?: GeolocationPosition | null,
): Promise<CommerceComparisonResult> => {
  let context = await resolveVisitorCommerceContext(region);
  if (forcedPosition) {
    context = {
      ...context,
      latitude: forcedPosition.coords.latitude,
      longitude: forcedPosition.coords.longitude,
      locationPrecision: 'PRECISE',
      source: 'BROWSER_GEOLOCATION',
    };
  }

  const fallback = fallbackOffers(product, context);
  const params = new URLSearchParams({
    productId: product.id,
    q: product.searchKeyword || product.nameEn,
    nameKr: product.nameKr || '',
    country: context.countryCode,
  });
  if (context.latitude != null) params.set('lat', String(context.latitude));
  if (context.longitude != null) params.set('lng', String(context.longitude));

  try {
    const response = await fetch(`/api/commerce/offers?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`commerce ${response.status}`);
    const body = await response.json();
    const live = Array.isArray(body.offers)
      ? body.offers.map(normalizeOffer).filter(Boolean) as CommerceOffer[]
      : [];
    const offers = mergeOffers(live, fallback);
    return { context, offers, ...recommend(offers), runtimeStatus: live.length ? 'LIVE_PARTIAL' : 'FALLBACK_ONLY' };
  } catch {
    return { context, offers: fallback, runtimeStatus: 'FALLBACK_ONLY' };
  }
};
