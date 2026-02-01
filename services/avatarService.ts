import { Author } from '../types';
import { generateAvatarImage } from './geminiService';
import { FALLBACK_IMAGE_BASE64 } from '../utils/imageUtils';

const AVATAR_CACHE_PREFIX = 'k-kitchen-avatar-';
// [FIX] Define constants for the LRU cache mechanism to prevent localStorage quota errors.
const AVATAR_LRU_INDEX_KEY = 'k-kitchen-avatar-lru-index';
const AVATAR_CACHE_SIZE = 50; // Store up to 50 most recent avatars.

// This service manages generating and caching base avatars for virtual personas
// to ensure consistency and remove dependency on external services like pravatar.
const avatarCache = new Map<string, string>(); // In-memory cache for the session

// [FIX] Helper to get the LRU index array from localStorage.
const getLruIndex = (): string[] => {
  try {
    const indexJson = localStorage.getItem(AVATAR_LRU_INDEX_KEY);
    return indexJson ? JSON.parse(indexJson) : [];
  } catch {
    // If parsing fails, it's corrupted, so reset it.
    localStorage.removeItem(AVATAR_LRU_INDEX_KEY);
    return [];
  }
};

// [FIX] Helper to save the LRU index array to localStorage.
const saveLruIndex = (index: string[]): void => {
  try {
    localStorage.setItem(AVATAR_LRU_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn('[CACHE] Could not save LRU index.', error);
  }
};

// [FIX] Marks an item as recently used by moving its ID to the end of the index.
const touchLruItem = (authorId: string): void => {
  let index = getLruIndex();
  // Remove from current position
  const existingIndex = index.indexOf(authorId);
  if (existingIndex > -1) {
    index.splice(existingIndex, 1);
  }
  // Add to the end (most recent)
  index.push(authorId);
  saveLruIndex(index);
};

// [FIX] Adds a new item to the cache, evicting the oldest if necessary.
const addLruItem = (authorId: string, avatarBase64: string): void => {
  try {
    let index = getLruIndex();
    
    // Evict if cache is full.
    if (index.length >= AVATAR_CACHE_SIZE && index.indexOf(authorId) === -1) {
      const lruId = index.shift(); // Remove the oldest id from the start.
      if (lruId) {
        localStorage.removeItem(`${AVATAR_CACHE_PREFIX}${lruId}`);
        console.log(`🧹 [CACHE] Evicted avatar for ${lruId} to make space.`);
      }
    }

    // Add the new item's data.
    localStorage.setItem(`${AVATAR_CACHE_PREFIX}${authorId}`, avatarBase64);
    
    // Update index: remove if exists, then add to end.
    index = index.filter(id => id !== authorId);
    index.push(authorId);
    saveLruIndex(index);

  } catch (error) {
    console.warn(`[CACHE] Failed to save avatar for ${authorId} to localStorage, likely due to storage quota. Will use in-memory cache for this session.`, error);
  }
};

export const getAvatar = async (author: Author): Promise<string> => {
  const cacheKey = `${AVATAR_CACHE_PREFIX}${author.id}`;

  // 1. Check in-memory cache first
  if (avatarCache.has(author.id)) {
    return avatarCache.get(author.id)!;
  }

  // 2. Check localStorage for persistence across sessions
  const storedAvatar = localStorage.getItem(cacheKey);
  if (storedAvatar) {
    avatarCache.set(author.id, storedAvatar); // Populate in-memory cache
    touchLruItem(author.id); // Mark as recently used
    return storedAvatar;
  }

  // 3. If not found, generate a new avatar
  try {
    console.log(`🎨 [AVATAR BOT] Generating new avatar for ${author.name}...`);
    const newAvatarBase64 = await generateAvatarImage(author);
    
    addLruItem(author.id, newAvatarBase64); // Add to LRU cache in localStorage
    avatarCache.set(author.id, newAvatarBase64); // Add to in-memory cache

    console.log(`✅ [AVATAR BOT] Successfully created and cached avatar for ${author.name}.`);
    return newAvatarBase64;
  } catch (error) {
    console.error(`🔴 [AVATAR BOT] Failed to generate avatar for ${author.name}. Using fallback.`, error);
    const fallback = FALLBACK_IMAGE_BASE64;
    avatarCache.set(author.id, fallback);
    // We don't cache the fallback in localStorage to avoid filling it with useless data.
    return fallback;
  }
};