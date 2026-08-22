import { Post } from '../types';
import { generateInitialFeed } from '../data/seed';
import { getPostsFromFirestore, addPostToFirestore } from './firebaseService';

const localFeed = (): Post[] => generateInitialFeed();

/**
 * Canonical runtime is stored Seed/backdata first.
 * Firebase is an optional persistence layer only when it actually returns data.
 */
export const getPosts = async (): Promise<Post[]> => {
  try {
    const posts = await getPostsFromFirestore();
    if (Array.isArray(posts) && posts.length > 0) return posts;
  } catch (error) {
    console.warn('Firebase post backend unavailable; using K-Food Seed backdata.', error);
  }
  return localFeed();
};

export const addPost = async (newPost: Post): Promise<void> => {
  try {
    await addPostToFirestore(newPost);
  } catch (error) {
    console.warn('Optional Firebase persistence unavailable; front remains usable with local Seed state.', error);
  }
};
