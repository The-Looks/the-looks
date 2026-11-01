// Tên ngắn cho các kiểu sinh từ contract, dùng chung giữa các feature.
import type { components as Auth } from './schema/auth';
import type { components as Billing } from './schema/billing';
import type { components as Outfit } from './schema/outfit';
import type { components as Voting } from './schema/voting';
import type { components as Wardrobe } from './schema/wardrobe';

export type User = Auth['schemas']['User'];

export type WardrobeItem = Wardrobe['schemas']['WardrobeItem'];
export type ItemStatus = Wardrobe['schemas']['ItemStatus'];
export type Category = Wardrobe['schemas']['Category'];
export type ClothingAttributes = Wardrobe['schemas']['ClothingAttributes'];
export type Scan = Wardrobe['schemas']['Scan'];

export type Occasion = Outfit['schemas']['Occasion'];
export type OutfitItem = Outfit['schemas']['OutfitItem'];
export type OutfitSuggestion = Outfit['schemas']['OutfitSuggestion'];
export type SavedOutfit = Outfit['schemas']['Outfit'];
export type OutfitDetail = Outfit['schemas']['OutfitDetail'];

export type Poll = Voting['schemas']['Poll'];
export type PollResult = Voting['schemas']['PollResult'];

export type Plan = Billing['schemas']['Plan'];
export type BillingPeriod = Billing['schemas']['BillingPeriod'];
export type PlanInfo = Billing['schemas']['PlanInfo'];
export type Entitlements = Billing['schemas']['Entitlements'];
export type BillingOrder = Billing['schemas']['Order'];
