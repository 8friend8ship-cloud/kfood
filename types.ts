
export interface Product {
  id: string;
  nameEn: string; // "Cast Iron Cauldron Lid"
  nameKr: string; // "Sot-ddu-keong"
  description: string;
  priceUsd: number;
  priceKr: number; // Added for domestic pricing
  category: 'tool' | 'ingredient' | 'tableware';
  links: {
    global: string; // Amazon/eBay link
    kr: string; // Coupang/Naver link
  };
  image: string;
}

export interface Tag {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  product: Product;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
  tags: Tag[];
  likes: number;
}

export enum Region {
  GLOBAL = 'GLOBAL',
  KR = 'KR'
}

export interface DetectedItem {
  name: string;
  koreanName?: string;
  confidence: number;
  description: string;
  suggestedCategory: 'tool' | 'ingredient' | 'tableware';
  // [ymin, xmin, ymax, xmax] in 0-100 scale
  boundingBox?: number[]; 
}
