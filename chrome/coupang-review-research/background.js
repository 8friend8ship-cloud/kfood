chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'KFOOD_COUPANG_QUEENS_DOWNLOAD') return;

  const payload = message.payload || {};
  const productId = String(payload.productId || 'unknown').replace(/[^0-9A-Za-z_-]/g, '_');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `KFood_Queens/Coupang/KFOOD_QUEENS_COUPANG_${productId}_${stamp}.json`;
  const json = JSON.stringify(payload, null, 2);
  const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

  chrome.downloads.download({ url, filename, saveAs: false }, (downloadId) => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }
    sendResponse({ ok: true, downloadId, filename });
  });

  return true;
});
