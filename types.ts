
export interface Author {
  id: string;
  name: string;
  title?: string;
  followers?: number;
  avatar: string;
  country?: string;
  badge?: string;
}

export interface Product {
  id: string;
  nameEn: string; // "Cast Iron Cauldron Lid"
  nameKr: string; // "Sot-ddu-keong"
  searchKeyword?: string; // "Korean BBQ Grill Pan Non-stick" (Optimized for Amazon)
  description: string;
  priceUsd: number;
  priceKr: number; // Added for domestic pricing
  category: 'tool' | 'ingredient' | 'tableware' | 'snack' | 'sauce' | 'kit';
  links: {
    global: string; // Amazon/eBay link
    kr: string; // Coupang/Naver link
  };
  image: string;
  // New fields for extended data
  isBestseller?: boolean;
  productTags?: string[]; // e.g. ["Noodle", "Mild", "Classic"]
  bestVideoUrl?: string; // Curated YouTube link (Mukbang/Review)
}

export interface Tag {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  product: Product;
}

export interface RecipeEssential {
  product: Product;
  reason: string; // "Must-have for the spicy red broth."
}

export interface Post {
  id: string;
  title: string;
  author: Author;
  imageUrl: string;
  description: string;
  tags: Tag[];
  likes: number;
  recipeEssentials?: RecipeEssential[]; // Hidden ingredients list
  // 4D Sensory Experience
  videoUrl?: string; // Loop video (WebM/MP4)
  audioUrl?: string; // ASMR Sound (MP3)
  bestVideoUrl?: string; // Manual override for specific Mukbang/Recipe video
}

export enum Region {
  GLOBAL = 'GLOBAL',
  KR = 'KR'
}

export interface DetectedItem {
  name: string;
  koreanName?: string;
  searchKeyword?: string; // New field for AI-optimized keywords
  confidence: number;
  description: string;
  suggestedCategory: 'tool' | 'ingredient' | 'tableware' | 'snack' | 'sauce' | 'kit';
  // [ymin, xmin, ymax, xmax] in 0-100 scale
  boundingBox?: number[]; 
}

export interface Theme {
  id: string;
  title: string;
  icon: string; // Emoji or icon name
  description: string;
  keywords: string[]; // Keywords to filter posts/products
  gradient: string; // CSS class for background
}