export interface Location {
  id: string;
  name: string;
  price: number;
  isRecommended?: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  required?: boolean;
  dependsOn?: string[];
}

export interface Business {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  baseProfit: number;
  baseTime: number;
  locations: Location[];
  upgrades: Upgrade[];
  recommendedLocationId?: string;
  avoid?: boolean;
  synergyBonuses?: Array<{
    requiredBusinessId: string;
    profitMultiplier: number;
    description: string;
  }>;
  notes?: string;
  /**
   * True when a single-vehicle sell delivery is achievable solo. Only set on
   * businesses that produce stock and run a sell mission. Semantics: sell at
   * low/partial stock keeps it one vehicle; full-stock sells on some
   * businesses can still spawn multiple vehicles. Left undefined for
   * businesses with no stock-sell mission (vehicles, clubhouse, safe-only).
   */
  soloFriendlySell?: boolean;
  /**
   * Safe overflow cap (income stops accruing until collected). Only set where
   * the app's own data already carries a cap value. Note: most safe businesses
   * do NOT have a cap value in this app's data -- see the field's usage.
   */
  safeCollectionCap?: number;
}

export interface BusinessCategory {
  id: string;
  name: string;
  order: number;
}

// Bunker-only operational state (real mechanic: staff can be assigned to
// stock manufacturing, research, or split across both -- splitting slows
// both). Optional and meaningless for any other business.id.
export type BunkerStaffAllocation = 'manufacturing' | 'research' | 'both';

export interface OwnedBusiness {
  businessId: string;
  locationId: string;
  purchasedUpgradeIds: string[];
  staffAllocation?: BunkerStaffAllocation;
}

export interface EmpireState {
  ownedBusinesses: OwnedBusiness[];
  ownedVehicles: string[];
}
