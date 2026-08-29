import { Timestamp } from 'firebase/firestore';

export interface Author {
  id: string;
  name: string;
  title?: string;
  followers?: number;
  avatar: string;
  country?: string;
  badge?: string;
  timezone?: string;
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
  spendable_credits: number;
  bonus_credits?: number;
  bonus_credits_expiry?: Timestamp;
  bonus_credits_breakdown?: BonusCreditBatch[];
  last_daily_claim?: Timestamp;
  phone_payout?: {
    phone_number: string;
    verified: boolean;
    country: string;
    micro_payment_id?: string;
    last_payout?: number;
    payout_count?: number;
  };
  cashouts?: Cashout[];
  created_at: Timestamp;
  auto_recharge?: {
    enabled: boolean;
    amount: number;
    threshold: number;
  };
  expired_log?: CreditExpirationLog[];
  notification_email?: string;
  notification_settings?: {
    email_30_day_warning?: boolean;
    push_7_day_warning?: boolean;
    inactivity_warning?: boolean;
  };
  recharge_history?: RechargeLog[];
}

export interface Product {
  id: string;
  nameEn: string;
  nameKr: string;
  searchKeyword?: string;
  description: string;
  priceUsd: number;
  priceKr: number;
  category: 'tool' | 'ingredient' | 'tableware' | 'snack' | 'sauce' | 'kit' | 'drink';
  links: {
    global: string;
    kr: string;
    naver?: string;
  };
  image: string;
  isBestseller?: boolean;
  productTags?: string[];
  bestVideoUrl?: string;
}

export interface Tag {
  id: string;
  x: number;
  y: number;
  product: Product;
}

export interface RecipeEssential {
  product: Product;
  reason: string;
}

export type CommunitySubmissionKind = 'food_photo' | 'receipt';
export type CommunityVerificationStatus = 'AUTO_FORMATTED' | 'NEEDS_REVIEW';
export type CommunityStorageStatus = 'LOCAL_TEST' | 'QUEUED_FOR_DRIVE' | 'SAVED_TO_DRIVE' | 'FAILED_TEST';

export interface CommunityTemplateMetadata {
  version: 'family-budget-v1';
  sourceKind: CommunitySubmissionKind;
  sourceLabel: string;
  dishName: string;
  servings: number;
  ingredientCount: number;
  costType: 'actual' | 'unverified';
  costAmount?: number;
  currency: string;
  storeName?: string;
  originalFileName?: string;
  verificationStatus: CommunityVerificationStatus;
  storageStatus: CommunityStorageStatus;
  generatedAt: number;
  sections: string[];
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
  recipeEssentials?: RecipeEssential[];
  videoUrl?: string;
  audioUrl?: string;
  bestVideoUrl?: string;
  createdAt?: number;
  isRecipe?: boolean;
  isCinemagraph?: boolean;
  cinemagraphEffect?: 'steam';
  isBoosted?: boolean;
  communityTemplate?: CommunityTemplateMetadata;
}

export enum Region {
  GLOBAL = 'GLOBAL',
  KR = 'KR'
}

export interface DetectedItem {
  name: string;
  koreanName?: string;
  searchKeyword?: string;
  confidence: number;
  description: string;
  suggestedCategory: 'tool' | 'ingredient' | 'tableware' | 'snack' | 'sauce' | 'kit';
  boundingBox?: number[];
}

export interface Theme {
  id: string;
  title: string;
  icon: string;
  description: string;
  keywords: string[];
  gradient: string;
}
