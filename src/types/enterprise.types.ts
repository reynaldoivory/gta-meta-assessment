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
