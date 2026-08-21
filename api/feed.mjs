import { readBoundedJsonResponse, validateFeedSnapshot, validateFeedSourceUrl } from '../services/feedContract.mjs';

const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 2;

const fetchApprovedSource = async (initialUrl) => {
  let url = validateFeedSourceUrl(initialUrl);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (response.status < 300 || response.status >= 400) return response;
    if (redirectCount === MAX_REDIRECTS) throw new Error('FEED_REDIRECT_LIMIT');
    const location = response.headers.get('location');
    if (!location) throw new Error('FEED_REDIRECT_WITHOUT_LOCATION');
    url = validateFeedSourceUrl(new URL(location, url).toString());
  }
  throw new Error('FEED_REDIRECT_LIMIT');
};

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const sourceUrl = process.env.KFOOD_FEED_URL;
  if (!sourceUrl) return response.status(503).json({ ok: false, error: 'FEED_NOT_CONFIGURED' });

  try {
    const upstream = await fetchApprovedSource(sourceUrl);
    const raw = await readBoundedJsonResponse(upstream);
    const snapshot = validateFeedSnapshot(raw);
    return response.status(200).json({ ok: true, ...snapshot });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'FEED_UNAVAILABLE';
    console.error('KFood feed rejected:', code);
    return response.status(502).json({ ok: false, error: code });
  }
}
