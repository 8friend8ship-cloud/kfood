import { Author, DetectedItem, Product, RecipeEssential } from '../types';
import { FALLBACK_IMAGE_BASE64 } from '../utils/imageUtils';

const safeName = (value: string | undefined, fallback: string) => (value || fallback).trim();

/**
 * Canonical K-Food MVP uses prepared Seed/T1/T2 data first.
 * These helpers intentionally avoid Firebase/Gemini network calls.
 */
export const analyzeKitchenImage = async (
  _base64Image: string,
  productsToFind: Product[] = []
): Promise<DetectedItem[]> => {
  return productsToFind.slice(0, 8).map((product, index) => ({
    name: product.nameEn,
    koreanName: product.nameKr,
    searchKeyword: product.searchKeyword || product.nameEn,
    confidence: Math.max(0.7, 0.95 - index * 0.03),
    description: product.description,
    suggestedCategory: product.category === 'drink' ? 'ingredient' : product.category as DetectedItem['suggestedCategory']
  }));
};

export const generateAvatarImage = async (author: Author): Promise<string> => {
  return author.avatar || FALLBACK_IMAGE_BASE64;
};

export const generatePersonaImage = async (
  referenceAvatarBase64: string,
  _food: string,
  _setting: string,
  style: 'person' | 'food_only' = 'person'
): Promise<string> => {
  if (style === 'person' && referenceAvatarBase64) return referenceAvatarBase64;
  return FALLBACK_IMAGE_BASE64;
};

export const generateAuthorStory = async (author: Author): Promise<string> => {
  const country = safeName(author.country, 'Global');
  const title = safeName(author.title, 'K-Food creator');
  return `${author.name} is a ${title} from ${country}. This creator profile is assembled from stored persona and K-Food Seed data without a generative API call.`;
};

export const generatePostContent = async (
  author: Author,
  product: Product,
  isRecipeHack: boolean,
  mealContext?: string,
): Promise<{ title: string; description: string }> => {
  const context = safeName(mealContext, isRecipeHack ? 'quick K-Food hack' : 'everyday K-Food moment');
  return {
    title: isRecipeHack
      ? `${product.nameEn}: a quick K-Food hack`
      : `${author.name}'s ${product.nameEn}`,
    description: `${context}. ${product.description} Product source and purchase links come from the stored K-Food catalog; freshness should be revalidated only when the product record is stale.`
  };
};

export const generateRecipeEssentials = async (
  _base64Image: string,
  _dishName: string
): Promise<RecipeEssential[]> => [];

export const getLocalizedIngredient = async (
  product: Product,
  author: Author
): Promise<{ localizedName: string; localizedDescription: string } | null> => {
  if (product.category !== 'ingredient' || author.country === 'Korea') return null;
  const isLocalizable = ['beef', 'pork', 'chicken', 'lamb', 'fish'].some(kw =>
    product.nameEn.toLowerCase().includes(kw)
  );
  if (!isLocalizable) return null;

  return {
    localizedName: product.nameEn,
    localizedDescription: `${product.description} Check the local equivalent in ${safeName(author.country, 'your region')} before purchase.`
  };
};
