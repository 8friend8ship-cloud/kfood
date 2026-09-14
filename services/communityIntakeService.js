export function buildCommunityIngestPayload(post, originalFileName = '') {
  if (!post?.id || !post?.imageUrl) {
    throw new Error('A community post with id and imageUrl is required.');
  }

  return {
    action: 'COMMUNITY_SUBMISSION',
    submissionId: post.id,
    originalFileName: originalFileName || post.communityTemplate?.originalFileName || 'community-upload.jpg',
    sourceKind: post.communityTemplate?.sourceKind || 'food_photo',
    post,
    submittedAt: new Date(post.createdAt || Date.now()).toISOString(),
  };
}

export async function submitCommunityDraft({
  post,
  originalFileName = '',
  endpoint = '',
  fetchImpl = globalThis.fetch,
} = {}) {
  const payload = buildCommunityIngestPayload(post, originalFileName);

  if (!endpoint) {
    return {
      ok: true,
      mode: 'LOCAL_TEST',
      status: 'LOCAL_TEST',
      submissionId: payload.submissionId,
    };
  }

  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is required when an ingest endpoint is configured.');
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Community ingest failed with status ${response.status}.`);
  }

  const result = await response.json();
  return {
    ok: true,
    mode: 'APPS_SCRIPT',
    status: result.status || 'SAVED_TO_DRIVE',
    submissionId: result.submissionId || payload.submissionId,
    driveFolderId: result.driveFolderId,
    imageFileId: result.imageFileId,
  };
}
