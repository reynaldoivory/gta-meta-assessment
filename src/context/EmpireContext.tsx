import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EmpireState, OwnedBusiness } from '../types/enterprise.types';

const STORAGE_KEY = 'gtaEmpireState_v1';

type EmpireContextValue = {
  state: EmpireState;
  setBusinessOwned: (businessId: string, owned: boolean, locationId?: string) => void;
  updateBusinessLocation: (businessId: string, locationId: string) => void;
  toggleBusinessUpgrade: (businessId: string, upgradeId: string) => void;
  clearOwnedBusinesses: () => void;
};

const EmpireContext = createContext<EmpireContextValue | null>(null);

const getDefaultState = (): EmpireState => ({
  ownedBusinesses: [],
  ownedVehicles: [],
});

const loadState = (): EmpireState => {
  if (typeof localStorage === 'undefined') {
    return getDefaultState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    const parsed = JSON.parse(stored) as EmpireState;
    if (!parsed || !Array.isArray(parsed.ownedBusinesses)) {
      return getDefaultState();
    }
    return {
      ownedBusinesses: parsed.ownedBusinesses,
      ownedVehicles: Array.isArray(parsed.ownedVehicles) ? parsed.ownedVehicles : [],
    };
  } catch (error) {
    console.error('Failed to load empire state:', error);
    return getDefaultState();
  }
};

const toggleUpgradeId = (upgradeIds: string[], upgradeId: string): string[] => {
  if (upgradeIds.includes(upgradeId)) {
    return upgradeIds.filter((id) => id !== upgradeId);
  }
  return [...upgradeIds, upgradeId];
};

const updateOwnedBusinessUpgrade = (
  item: OwnedBusiness,
  businessId: string,
  upgradeId: string
): OwnedBusiness => {
  if (item.businessId !== businessId) {
    return item;
  }

  return {
    ...item,
    purchasedUpgradeIds: toggleUpgradeId(item.purchasedUpgradeIds, upgradeId),
  };
};

export const EmpireProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<EmpireState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save empire state:', error);
    }
  }, [state]);

  const setBusinessOwned = (businessId: string, owned: boolean, locationId?: string) => {
    setState((prev) => {
      if (!owned) {
        return {
          ...prev,
          ownedBusinesses: prev.ownedBusinesses.filter((item) => item.businessId !== businessId),
        };
      }

      const existing = prev.ownedBusinesses.find((item) => item.businessId === businessId);
      const nextEntry: OwnedBusiness = existing
        ? {
            ...existing,
            locationId: locationId ?? existing.locationId,
          }
        : {
            businessId,
            locationId: locationId ?? '',
            purchasedUpgradeIds: [],
          };

      return {
        ...prev,
        ownedBusinesses: [...prev.ownedBusinesses.filter((item) => item.businessId !== businessId), nextEntry],
      };
    });
  };

  const updateBusinessLocation = (businessId: string, locationId: string) => {
    setState((prev) => ({
      ...prev,
      ownedBusinesses: prev.ownedBusinesses.map((item) =>
        item.businessId === businessId ? { ...item, locationId } : item
      ),
    }));
  };

  const toggleBusinessUpgrade = (businessId: string, upgradeId: string) => {
    setState((prev) => ({
      ...prev,
      ownedBusinesses: prev.ownedBusinesses.map((item) =>
        updateOwnedBusinessUpgrade(item, businessId, upgradeId)
      ),
    }));
  };

  const clearOwnedBusinesses = () => {
    setState((prev) => ({ ...prev, ownedBusinesses: [] }));
  };

  const value = useMemo(
    () => ({
      state,
      setBusinessOwned,
      updateBusinessLocation,
      toggleBusinessUpgrade,
      clearOwnedBusinesses,
    }),
    [state]
  );

  return <EmpireContext.Provider value={value}>{children}</EmpireContext.Provider>;
};

export const useEmpire = () => {
  const context = useContext(EmpireContext);
  if (!context) {
    throw new Error('useEmpire must be used within an EmpireProvider');
  }
  return context;
};
