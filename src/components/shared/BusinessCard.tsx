import { useMemo } from 'react';
import AssetCard from './AssetCard';
import { useEmpire } from '../../context/EmpireContext';
import type { Business, Upgrade } from '../../types/enterprise.types';

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString()}`;

const sumUpgrades = (upgrades: Upgrade[], selected: string[]) =>
  upgrades.reduce((total, upgrade) => (selected.includes(upgrade.id) ? total + upgrade.cost : total), 0);

const getSortedLocations = (locations: Business['locations']) =>
  [...locations].sort((a, b) => a.price - b.price);

const getDefaultLocationId = (business: Business, locations: Business['locations']) =>
  business.recommendedLocationId || locations[0]?.id || '';

const getLocationById = (locations: Business['locations'], locationId: string) =>
  locations.find((entry) => entry.id === locationId) || locations[0];

const getTotalCost = (locationCost: number, upgradesTotal: number) => locationCost + upgradesTotal;

const getOptionLabel = (entry: Business['locations'][number]) =>
  `${entry.name} - ${formatMoney(entry.price)}${entry.isRecommended ? ' (Recommended)' : ''}`;

const getCategoryBadge = (categoryId: string) => {
  switch (categoryId) {
    case 'mc':
      return 'MC';
    case 'moneyFront':
      return 'MF';
    case 'core':
      return 'CORE';
    case 'vehicle':
      return 'VEH';
    case 'mansion':
      return 'MANS';
    case 'clubhouse':
      return 'CLUB';
    case 'specialized':
      return 'SPEC';
    default:
      return 'BIZ';
  }
};

type BusinessCardProps = {
  business: Business;
};

const BusinessLocationSelect = ({
  business,
  locationId,
  locations,
  onChange,
}: {
  business: Business;
  locationId: string;
  locations: Business['locations'];
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1">
    <label htmlFor={`${business.id}-location`} className="text-xs font-semibold uppercase text-slate-400">
      Location
    </label>
    <select
      id={`${business.id}-location`}
      value={locationId}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
    >
      {locations.map((entry) => (
        <option key={entry.id} value={entry.id}>
          {getOptionLabel(entry)}
        </option>
      ))}
    </select>
  </div>
);

const BusinessUpgradeList = ({
  upgrades,
  selectedUpgrades,
  onToggle,
}: {
  upgrades: Upgrade[];
  selectedUpgrades: string[];
  onToggle: (upgradeId: string) => void;
}) => {
  if (upgrades.length === 0) {
    return <p className="text-xs text-slate-500">No upgrades available.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-slate-400">Upgrades</div>
      {upgrades.map((upgrade) => (
        <label key={upgrade.id} className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={selectedUpgrades.includes(upgrade.id)}
            onChange={() => onToggle(upgrade.id)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-600"
          />
          <span>{upgrade.name}</span>
          <span className="ml-auto text-xs font-mono text-slate-400">{formatMoney(upgrade.cost)}</span>
        </label>
      ))}
    </div>
  );
};

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const { state, setBusinessOwned, updateBusinessLocation, toggleBusinessUpgrade } = useEmpire();
  const ownedBusiness = useMemo(
    () => state.ownedBusinesses.find((item) => item.businessId === business.id),
    [state.ownedBusinesses, business.id]
  );
  const sortedLocations = useMemo(() => getSortedLocations(business.locations), [business.locations]);
  const defaultLocationId = getDefaultLocationId(business, sortedLocations);
  const isOwned = Boolean(ownedBusiness);
  const locationId = ownedBusiness?.locationId || defaultLocationId;
  const selectedUpgrades = ownedBusiness?.purchasedUpgradeIds || [];
  const location = getLocationById(sortedLocations, locationId);
  const upgradesTotal = sumUpgrades(business.upgrades, selectedUpgrades);
  const locationCost = location?.price || 0;
  const totalCost = getTotalCost(locationCost, upgradesTotal);

  const handleToggleOwned = () => {
    if (!isOwned) {
      const nextLocation = locationId || defaultLocationId;
      setBusinessOwned(business.id, true, nextLocation);
      return;
    }

    setBusinessOwned(business.id, false);
  };

  const handleLocationChange = (value: string) => updateBusinessLocation(business.id, value);
  const handleUpgradeToggle = (upgradeId: string) => toggleBusinessUpgrade(business.id, upgradeId);

  return (
    <AssetCard
      label={business.name}
      emoji={getCategoryBadge(business.categoryId)}
      isOwned={isOwned}
      onToggle={handleToggleOwned}
      cost={formatMoney(totalCost)}
    >
      <div className="space-y-4">
        {business.description && (
          <p className="text-xs text-slate-400">{business.description}</p>
        )}
        <BusinessLocationSelect
          business={business}
          locationId={locationId}
          locations={sortedLocations}
          onChange={handleLocationChange}
        />

        <BusinessUpgradeList
          upgrades={business.upgrades}
          selectedUpgrades={selectedUpgrades}
          onToggle={handleUpgradeToggle}
        />

        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
          <span>Base profit: {formatMoney(business.baseProfit)}</span>
          <span>Base time: {business.baseTime} min</span>
        </div>
      </div>
    </AssetCard>
  );
};
