type ProviderOffer = {
  provider: 'COUPANG' | 'ALIEXPRESS' | 'AMAZON';
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
  deliveryStatus: 'DELIVERABLE' | 'NOT_DELIVERABLE' | 'UNKNOWN';
  deliveryEta?: string;
  priceVerifiedAt?: string;
  deliveryVerifiedAt?: string;
  evidence?: string;
  live: boolean;
};

const safeText = (value: unknown, max = 180) => String(value ?? '').trim().slice(0, max);

const queryValue = (req: any, key: string) => {
  const value = req.query?.[key];
  return Array.isArray(value) ? safeText(value[0]) : safeText(value);
};

const fetchProviderProxy = async (
  provider: 'COUPANG' | 'ALIEXPRESS',
  req: any,
): Promise<ProviderOffer[]> => {
  const prefix = provider === 'COUPANG' ? 'COUPANG' : 'ALIEXPRESS';
  const url = process.env[`${prefix}_COMMERCE_PROXY_URL`];
  if (!url) return [];
  const token = process.env[`${prefix}_COMMERCE_PROXY_TOKEN`];

  const payload = {
    q: queryValue(req, 'q'),
    productId: queryValue(req, 'productId'),
    nameKr: queryValue(req, 'nameKr'),
    country: queryValue(req, 'country'),
    lat: queryValue(req, 'lat') || undefined,
    lng: queryValue(req, 'lng') || undefined,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return [];
  const body = await response.json();
  if (!Array.isArray(body?.offers)) return [];

  return body.offers
    .filter((offer: any) => offer && typeof offer.url === 'string')
    .slice(0, 10)
    .map((offer: any) => ({
      provider,
      label: provider === 'COUPANG' ? 'Coupang' : 'AliExpress',
      title: safeText(offer.title || payload.q),
      url: safeText(offer.url, 1600),
      affiliate: Boolean(offer.affiliate),
      currency: safeText(offer.currency, 8) || undefined,
      itemPrice: Number.isFinite(Number(offer.itemPrice)) ? Number(offer.itemPrice) : undefined,
      shippingPrice: Number.isFinite(Number(offer.shippingPrice)) ? Number(offer.shippingPrice) : undefined,
      totalPrice: Number.isFinite(Number(offer.totalPrice)) ? Number(offer.totalPrice) : undefined,
      unitQuantity: Number.isFinite(Number(offer.unitQuantity)) ? Number(offer.unitQuantity) : undefined,
      unitLabel: safeText(offer.unitLabel, 20) || undefined,
      unitCost: Number.isFinite(Number(offer.unitCost)) ? Number(offer.unitCost) : undefined,
      deliveryStatus: ['DELIVERABLE', 'NOT_DELIVERABLE'].includes(offer.deliveryStatus)
        ? offer.deliveryStatus
        : 'UNKNOWN',
      deliveryEta: safeText(offer.deliveryEta, 80) || undefined,
      priceVerifiedAt: safeText(offer.priceVerifiedAt, 60) || undefined,
      deliveryVerifiedAt: safeText(offer.deliveryVerifiedAt, 60) || undefined,
      evidence: safeText(offer.evidence, 300) || undefined,
      live: true,
    }));
};

let amazonTokenCache: { value: string; expiresAt: number } | null = null;

const getAmazonToken = async () => {
  if (amazonTokenCache && amazonTokenCache.expiresAt > Date.now() + 60_000) return amazonTokenCache.value;

  const clientId = process.env.AMAZON_CREATORS_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tokenEndpoint = process.env.AMAZON_CREATORS_TOKEN_ENDPOINT || 'https://api.amazon.com/auth/o2/token';
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  if (!response.ok) return null;
  const body = await response.json();
  if (!body?.access_token) return null;
  const expiresIn = Number(body.expires_in) || 3600;
  amazonTokenCache = { value: body.access_token, expiresAt: Date.now() + expiresIn * 1000 };
  return amazonTokenCache.value;
};

const fetchAmazonOffer = async (req: any): Promise<ProviderOffer[]> => {
  const partnerTag = process.env.AMAZON_ASSOCIATE_TAG;
  if (!partnerTag) return [];
  const accessToken = await getAmazonToken();
  if (!accessToken) return [];

  const marketplace = process.env.AMAZON_MARKETPLACE || 'www.amazon.com';
  const keywords = queryValue(req, 'q');
  if (!keywords) return [];

  const response = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'x-marketplace': marketplace,
    },
    body: JSON.stringify({
      keywords,
      searchIndex: 'All',
      itemCount: 3,
      marketplace,
      partnerTag,
      resources: [
        'itemInfo.title',
        'images.primary.medium',
        'offersV2.listings.price',
        'offersV2.listings.availability',
      ],
    }),
  });

  if (!response.ok) return [];
  const body = await response.json();
  const items = body?.searchResult?.items;
  if (!Array.isArray(items)) return [];

  return items.slice(0, 3).map((item: any): ProviderOffer => {
    const listing = item?.offersV2?.listings?.[0];
    const money = listing?.price?.money;
    const unit = listing?.price?.pricePerUnit;
    const availability = safeText(listing?.availability?.type, 30).toUpperCase();
    const itemPrice = Number.isFinite(Number(money?.amount)) ? Number(money.amount) : undefined;
    const unitCost = Number.isFinite(Number(unit?.amount)) ? Number(unit.amount) : undefined;
    const now = new Date().toISOString();

    return {
      provider: 'AMAZON',
      label: 'Amazon',
      title: safeText(item?.itemInfo?.title?.displayValue || item?.asin || keywords),
      url: safeText(item?.detailPageURL, 1600),
      affiliate: true,
      currency: safeText(money?.currency, 8) || undefined,
      itemPrice,
      totalPrice: itemPrice,
      unitCost,
      unitLabel: unitCost != null ? 'API unit' : undefined,
      deliveryStatus: 'UNKNOWN',
      priceVerifiedAt: now,
      evidence: availability
        ? `Amazon Creators API live price; availability=${availability}. Exact visitor-destination shipping is not inferred.`
        : 'Amazon Creators API live price. Exact visitor-destination shipping is not inferred.',
      live: true,
    };
  }).filter((offer: ProviderOffer) => Boolean(offer.url));
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const q = queryValue(req, 'q');
  if (!q) return res.status(400).json({ error: 'QUERY_REQUIRED' });

  const providerResults = await Promise.allSettled([
    fetchProviderProxy('COUPANG', req),
    fetchProviderProxy('ALIEXPRESS', req),
    fetchAmazonOffer(req),
  ]);

  const offers = providerResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);

  return res.status(200).json({
    schemaVersion: 'KFOOD_COMMERCE_OFFER_V1',
    generatedAt: new Date().toISOString(),
    country: queryValue(req, 'country'),
    locationUsed: Boolean(queryValue(req, 'lat') && queryValue(req, 'lng')),
    offers,
    providerState: {
      coupang: process.env.COUPANG_COMMERCE_PROXY_URL ? 'CONFIGURED_PROXY' : 'PENDING_PROXY_BIND',
      aliexpress: process.env.ALIEXPRESS_COMMERCE_PROXY_URL ? 'CONFIGURED_PROXY' : 'PENDING_PROXY_BIND',
      amazon: process.env.AMAZON_CREATORS_CLIENT_ID && process.env.AMAZON_CREATORS_CLIENT_SECRET && process.env.AMAZON_ASSOCIATE_TAG
        ? 'CREATORS_API_CONFIGURED'
        : 'CREATORS_API_CREDENTIAL_PENDING',
    },
    policy: {
      recommendationRequiresVerifiedDelivery: true,
      unknownDeliveryNotRecommended: true,
      noSecretSentToBrowser: true,
    },
  });
}
