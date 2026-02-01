import { Post } from '../types';
import { getPostsFromFirestore, addPostToFirestore } from './firebaseService';

// This service now acts as a bridge between the application and the Firebase backend,
// abstracting away the direct Firestore calls.

/**
 * Asynchronously fetches all posts from the Firestore database.
 * If the database is empty, it will be automatically seeded with initial data.
 * @returns A promise that resolves to an array of posts.
 */
export const getPosts = async (): Promise<Post[]> => {
  try {
    const posts = await getPostsFromFirestore();
    return posts;
  } catch (error) {
    console.error("Failed to load posts from Firestore:", error);
    // Return an empty array or handle error appropriately in the UI
    return [];
  }
};

/**
 * Asynchronously adds a new post to the Firestore database.
 * @param newPost The post object to be added.
 * @returns A promise that resolves when the post is successfully added.
 */
export const addPost = async (newPost: Post): Promise<void> => {
  try {
    await addPostToFirestore(newPost);
  } catch (error) {
    console.error("Failed to save post to Firestore:", error);
    // The UI update is optimistic, so this error is for logging/monitoring.
    // We could add a retry mechanism or user notification here if needed.
  }
};