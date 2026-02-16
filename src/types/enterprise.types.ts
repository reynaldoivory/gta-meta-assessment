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

export interface OwnedBusiness {
  businessId: string;
  locationId: string;
  purchasedUpgradeIds: string[];
}

export interface EmpireState {
  ownedBusinesses: OwnedBusiness[];
  ownedVehicles: string[];
}
