import { Post } from '../types';
import { addPostToFirestore } from './firebaseService';
import { readBoundedJsonResponse, validateFeedSnapshot } from './feedContract.mjs';

// Public discovery data comes only from the audited same-origin Core/Drive feed.
// User writes remain separate and fail closed when persistence is unavailable.

/**
 * Fetches a bounded, fresh snapshot from the server-side feed adapter.
 */
export interface FeedSnapshot {
  sourceId: string;
  sourceUpdatedAt: string;
  posts: Post[];
}

export const getFeedSnapshot = async (): Promise<FeedSnapshot> => {
  const response = await fetch('/api/feed', {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  const raw = await readBoundedJsonResponse(response);
  const snapshot = validateFeedSnapshot(raw);
  return {
    sourceId: snapshot.source_id,
    sourceUpdatedAt: snapshot.source_updated_at,
    posts: snapshot.posts as Post[],
  };
};

export const getPosts = async (): Promise<Post[]> => (await getFeedSnapshot()).posts;

/**
 * Asynchronously adds a new post to the Firestore database.
 * @param newPost The post object to be added.
 * @returns A promise that resolves when the post is successfully added.
 */
export const addPost = async (newPost: Post): Promise<void> => {
  await addPostToFirestore(newPost);
};
