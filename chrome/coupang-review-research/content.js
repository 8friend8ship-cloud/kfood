(() => {
  const MAX_SCROLLS = 18;
  const MAX_SAMPLES = 120;
  const SCROLL_WAIT_MS = 700;
  const SAMPLE_CHAR_LIMIT = 420;
  const REVIEW_BODY_SELECTORS = [
    '.sdp-review__article__list__review__content',
    '[class*="review__content"]',
    '[class*="review-content"]',
    '[data-review-content]'
  ];

  const CLUSTERS = {
    taste: ['맛', '고소', '달', '싱겁', '짠', '향'],
    value: ['가성비', '가격', '저렴', '비싸', '양', '용량'],
    freshness: ['신선', '유통기한', '상함', '냄새', '변질'],
    packaging: ['포장', '파손', '누수', '찌그러', '박스'],
    delivery: ['배송', '도착', '로켓', '지연'],
    cooking: ['요리', '레시피', '라떼', '파스타', '치즈', '베이킹', '샐러드'],
    texture: ['식감', '부드', '꾸덕', '묽', '진하'],
    repurchase: ['재구매', '또 살', '추천', '만족']
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function getProductId() {
    const match = location.pathname.match(/\/vp\/products\/(\d+)/);
    return match ? match[1] : 'unknown';
  }

  function findReviewSection() {
    const candidates = [...document.querySelectorAll('section, div, article')];
    return candidates.find((el) => {
      const text = normalize(el.textContent).slice(0, 120);
      return text.includes('상품평') || text.includes('상품 리뷰') || text.includes('구매후기');
    }) || null;
  }

  function extractVisibleReviewBodies() {
    const samples = [];
    const seen = new Set();

    for (const selector of REVIEW_BODY_SELECTORS) {
      for (const el of document.querySelectorAll(selector)) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        const text = normalize(el.textContent);
        if (text.length < 12) continue;
        const clipped = text.slice(0, SAMPLE_CHAR_LIMIT);
        if (seen.has(clipped)) continue;
        seen.add(clipped);
        samples.push({ text: clipped });
        if (samples.length >= MAX_SAMPLES) return samples;
      }
    }
    return samples;
  }

  function clusterSignals(samples) {
    const counts = Object.fromEntries(Object.keys(CLUSTERS).map((key) => [key, 0]));
    for (const sample of samples) {
      const text = sample.text;
      for (const [cluster, words] of Object.entries(CLUSTERS)) {
        if (words.some((word) => text.includes(word))) counts[cluster] += 1;
      }
    }
    return counts;
  }

  async function scanReviews() {
    if (location.hostname !== 'www.coupang.com' || !location.pathname.startsWith('/vp/products/')) {
      return { ok: false, error: 'NOT_COUPANG_PRODUCT_PAGE' };
    }

    const section = findReviewSection();
    if (section) section.scrollIntoView({ block: 'start', behavior: 'smooth' });
    await sleep(900);

    let previousCount = 0;
    let stableRounds = 0;
    let samples = [];

    for (let i = 0; i < MAX_SCROLLS; i += 1) {
      samples = extractVisibleReviewBodies();
      if (samples.length === previousCount) stableRounds += 1;
      else stableRounds = 0;
      previousCount = samples.length;

      if (samples.length >= MAX_SAMPLES || stableRounds >= 4) break;
      window.scrollBy({ top: Math.max(window.innerHeight * 0.8, 600), behavior: 'smooth' });
      await sleep(SCROLL_WAIT_MS);
    }

    const payload = {
      schemaVersion: 'KFOOD_COUPANG_REVIEW_QUEENS_V1',
      sourceProvider: 'COUPANG_PUBLIC_VISIBLE_REVIEW_UI',
      capturedAt: new Date().toISOString(),
      productId: getProductId(),
      productUrl: location.href.split('#')[0],
      reviewSampleCount: samples.length,
      signals: clusterSignals(samples),
      reviewSamples: samples,
      policy: {
        publicVisibleUiOnly: true,
        noLoginAutomation: true,
        noCaptchaBypass: true,
        noReviewerIdentityCollection: true,
        shortSnippetsOnly: true
      },
      nextStage: 'DRIVE_DOWNLOAD_SYNC→QUEENS_RESEARCH→SEED_QUALIFICATION→53_FOOD_RECIPE_ASSET_MAP'
    };

    chrome.runtime.sendMessage({ type: 'KFOOD_COUPANG_QUEENS_DOWNLOAD', payload }, () => {});
    return { ok: true, payload };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== 'KFOOD_COUPANG_REVIEW_SCAN') return;
    scanReviews().then(sendResponse).catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  });

  if (location.hash.includes('kfood-queens-scan')) {
    scanReviews().catch(() => {});
  }
})();
