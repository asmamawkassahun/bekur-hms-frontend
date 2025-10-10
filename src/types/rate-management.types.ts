import type { ApiResponse, QueryParams } from '@/types';

export type PricingRuleType =
  | 'OCCUPANCY_BASED'
  | 'SEASONAL'
  | 'DAY_OF_WEEK'
  | 'PROMOTIONAL'
  | 'EARLY_BIRD'
  | 'LAST_MINUTE'
  | 'PACKAGE';

export interface OccupancyThreshold {
  min: number;
  max: number;
  modifier: number;
}

export interface OccupancyBasedConfig {
  propertyId: string;
  thresholds: OccupancyThreshold[];
}

export interface SeasonalConfig { multiplier: number; }
export interface DayOfWeekConfig { days: Record<number, { multiplier: number }>; }
export interface DiscountConfigBase { discountPercent: number; }
export interface EarlyBirdConfig extends DiscountConfigBase { minDays: number; }
export interface LastMinuteConfig extends DiscountConfigBase { maxDays: number; }
export interface PackageConfig extends DiscountConfigBase { minNights: number; }

export type PricingRuleConfig =
  | OccupancyBasedConfig
  | SeasonalConfig
  | DayOfWeekConfig
  | DiscountConfigBase
  | EarlyBirdConfig
  | LastMinuteConfig
  | PackageConfig
  | Record<string, unknown>;

export interface PricingRule {
  id: string;
  propertyId: string;
  name: string;
  type: PricingRuleType;
  description?: string;
  config: PricingRuleConfig;
  startDate: string;
  endDate?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; name: string };
}

export interface CreatePricingRuleData {
  propertyId: string;
  name: string;
  type: PricingRuleType;
  description?: string;
  config: PricingRuleConfig;
  startDate: string;
  endDate?: string;
  priority?: number;
  isActive?: boolean;
}

export interface UpdatePricingRuleData {
  name?: string;
  description?: string;
  config?: PricingRuleConfig;
  startDate?: string;
  endDate?: string | null;
  priority?: number;
  isActive?: boolean;
}

export interface PricingQuery extends QueryParams {
  propertyId?: string;
  type?: PricingRuleType;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export type PricingRulesListResponse = ApiResponse<PricingRule[]>;
export type PricingRuleResponse = ApiResponse<PricingRule>;


