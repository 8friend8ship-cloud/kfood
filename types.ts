import { Timestamp } from 'firebase/firestore';

export interface Author {
  id: string;
  name: string;
  title?: string;
  followers?: number;
  avatar: string;
  country?: string;
  badge?: string;
  timezone?: string; // e.g. "America/New_York"
}

export interface Cashout {
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface BonusCreditBatch {
  source: 'purchase' | 'daily_reward' | 'promo';
  amount: number;
  expires_at: Timestamp;
}

export interface CreditExpirationLog {
  amount: number;
  expired_at: Timestamp;
}

export interface RechargeLog {
  krw: number;
  usd: number;
  credits: number;
  rate: number;
  toss_order_id: string;
  recharged_at: Timestamp;
}

export interface Creator {
  uid: string;
  tracking_id: string;
  referral_link: string;
  spendable_credits: number; // Cashable credits from purchases
  bonus_credits?: number; // Total non-cashable credits
  bonus_credits_expiry?: Timestamp; // Earliest expiry date for any bonus credits
  bonus_credits_breakdown?: BonusCreditBatch[]; // Detailed breakdown of bonus credits
  last_daily_claim?: Timestamp; // Timestamp for daily reward cooldown
  phone_payout?: {
    phone_number: string;
    verified: boolean;
    country: string; // The creator's country for payout optimization
    micro_payment_id?: string; // Required for KR phone refunds
    last_payout?: number; // in KRW
    payout_count?: number;
  };
  cashouts?: Cashout[];
  created_at: Timestamp;
  auto_recharge?: {
    enabled: boolean;
    amount: number;
    threshold: number;
  };
  expired_log?: CreditExpirationLog[]; // Logs recent credit expirations
  notification_email?: string; // New required field for notifications
  notification_settings?: {
    email_30_day_warning?: boolean; // D-30: "30일 남음 + 홍보" 메일
    push_7_day_warning?: boolean;   // D-7: 푸시 "7일 남음!"
    inactivity_warning?: boolean; // 6개월 비활동 경고
  };
  recharge_history?: RechargeLog[];
}

export interface Product {
  id: string;
  nameEn: string; // "Cast Iron Cauldron Lid"
  nameKr: string; // "Sot-ddu-keong"
  searchKeyword?: string; // "Korean BBQ Grill Pan Non-stick" (Optimized for Amazon)
  description: string;
  priceUsd: number;
  priceKr: number; // Added for domestic pricing
  category: 'tool' | 'ingredient' | 'tableware' | 'snack' | 'sauce' | 'kit' | 'drink';
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
  id:string;
  title: string;
  author: Author;
  imageUrl: string;
  description: string;
  tags: Tag[];
  likes: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  recipeEssentials?: RecipeEssential[]; // Hidden ingredients list
  // 4D Sensory Experience
  videoUrl?: string; // Loop video (WebM/MP4)
  audioUrl?: string; // ASMR Sound (MP3)
  bestVideoUrl?: string; // Manual override for specific Mukbang/Recipe video
  createdAt?: number; // Timestamp for "Just Now" feature
  isRecipe?: boolean; // Flag for creative recipe posts
  isCinemagraph?: boolean; // Flag for fake video posts
  cinemagraphEffect?: 'steam'; // Effect type for fake video
  isBoosted?: boolean; // Flag for promoted posts
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