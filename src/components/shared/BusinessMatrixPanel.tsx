import { useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { BUSINESS_CATEGORIES, BUSINESSES } from '../../data/verifiedPropertyData';
import { BusinessCard } from './BusinessCard';
import { TrapBlockingWarning } from './TrapWarnings';
import { useEmpire } from '../../context/EmpireContext';

type Trap = {
  id: string;
  title: string;
  severity: string;
  isCascadeTrap?: boolean;
};

type BusinessMatrixPanelProps = {
  cascadeTraps: Trap[];
  criticalTraps: Trap[];
  hasCriticalTrap: boolean;
};

const TrapAlerts = ({ cascadeTraps, criticalTraps, hasCriticalTrap }: BusinessMatrixPanelProps) => (
  <>
    {cascadeTraps.length > 0 && (
      <div className="space-y-3">
        {cascadeTraps.map((trap) => (
          <TrapBlockingWarning key={trap.id} trap={trap} onAcknowledge={() => {}} />
        ))}
      </div>
    )}

    {hasCriticalTrap && !cascadeTraps.length && (
      <div className="p-4 bg-gta-red/10 border-2 border-gta-red rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-gta-red flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gta-red mb-1">
              Critical Issue{criticalTraps.length === 1 ? '' : 's'}
            </h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {criticalTraps.map((trap) => (
                <li key={trap.id}>- {trap.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}
  </>
);

const getOwnedCount = (businesses: typeof BUSINESSES, ownedIds: Set<string>) =>
  businesses.filter((business) => ownedIds.has(business.id)).length;

const isOwnedOnlyView = (hasOwned: boolean, showAll: boolean) => hasOwned && !showAll;

const getRenderedBusinesses = (
  businesses: typeof BUSINESSES,
  ownedIds: Set<string>,
  hasOwned: boolean,
  showAll: boolean
) => {
  if (!isOwnedOnlyView(hasOwned, showAll)) {
    return businesses;
  }

  return businesses.filter((business) => ownedIds.has(business.id));
};

const CategorySection = ({
  categoryId,
  categoryName,
  businesses,
  ownedCount,
  isOpen,
  hasOwned,
  showAll,
  onToggleSection,
  onToggleShowAll,
  ownedIds,
}: {
  categoryId: string;
  categoryName: string;
  businesses: typeof BUSINESSES;
  ownedCount: number;
  isOpen: boolean;
  hasOwned: boolean;
  showAll: boolean;
  onToggleSection: (id: string) => void;
  onToggleShowAll: (id: string) => void;
  ownedIds: Set<string>;
}) => {
  const shouldShowOwnedOnly = isOwnedOnlyView(hasOwned, showAll);
  const renderedBusinesses = getRenderedBusinesses(businesses, ownedIds, hasOwned, showAll);

  return (
    <section className="bg-gta-panel border border-gta-green/30 rounded-lg">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => onToggleSection(categoryId)}
          className="text-left"
        >
          <div className="text-sm uppercase text-slate-400">{categoryName}</div>
          <div className="text-xs text-slate-500">
            Owned: {ownedCount} / {businesses.length}
          </div>
        </button>
        <div className="flex items-center gap-3">
          {isOpen && hasOwned && (
            <button
              type="button"
              onClick={() => onToggleShowAll(categoryId)}
              className="text-xs text-gta-green/80 hover:text-gta-green"
            >
              {showAll ? 'Show owned' : 'Show all'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleSection(categoryId)}
            className="p-1"
            aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-slate-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 pt-0 space-y-3">
          {shouldShowOwnedOnly && (
            <div className="text-xs text-slate-500">Showing owned only.</div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {renderedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const BusinessMatrixPanel = ({ cascadeTraps, criticalTraps, hasCriticalTrap }: BusinessMatrixPanelProps) => {
  const { state } = useEmpire();
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const firstCategoryId = BUSINESS_CATEGORIES[0]?.id;
    if (state.ownedBusinesses.length === 0 && firstCategoryId) {
      return [firstCategoryId];
    }
    return [];
  });
  const [showAllSections, setShowAllSections] = useState<string[]>([]);

  const businessesByCategory = useMemo(() => {
    return BUSINESS_CATEGORIES.map((category) => ({
      category,
      businesses: BUSINESSES.filter((business) => business.categoryId === category.id),
    }));
  }, []);

  const ownedBusinessIds = useMemo(
    () => new Set(state.ownedBusinesses.map((item) => item.businessId)),
    [state.ownedBusinesses]
  );

  const toggleSection = (categoryId: string) => {
    setOpenSections((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleShowAll = (categoryId: string) => {
    setShowAllSections((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const expandAllSections = () => {
    const allCategoryIds = BUSINESS_CATEGORIES.map((category) => category.id);
    setOpenSections(allCategoryIds);
    setShowAllSections(allCategoryIds);
  };

  const collapseAllSections = () => {
    setOpenSections([]);
  };

  const areAllSectionsOpen = openSections.length === BUSINESS_CATEGORIES.length;

  const toggleAllSections = () => {
    if (areAllSectionsOpen) {
      collapseAllSections();
      return;
    }

    expandAllSections();
  };

  return (
    <div className="space-y-6">
      <TrapAlerts
        cascadeTraps={cascadeTraps}
        criticalTraps={criticalTraps}
        hasCriticalTrap={hasCriticalTrap}
      />

      <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green/60 rounded-lg p-6">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-left"
            aria-label={areAllSectionsOpen ? 'Collapse all property sections' : 'Expand all property sections'}
          >
            <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-2">Property Matrix</h2>
            <p className="text-xs text-gta-gray">
              Expand a section, click any card to select, then configure location and upgrades.
            </p>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAllSections}
              className="px-3 py-2 rounded text-xs border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAllSections}
              className="px-3 py-2 rounded text-xs border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {businessesByCategory.map(({ category, businesses }) => (
        <CategorySection
          key={category.id}
          categoryId={category.id}
          categoryName={category.name}
          businesses={businesses}
          ownedCount={getOwnedCount(businesses, ownedBusinessIds)}
          isOpen={openSections.includes(category.id)}
          hasOwned={getOwnedCount(businesses, ownedBusinessIds) > 0}
          showAll={showAllSections.includes(category.id)}
          onToggleSection={toggleSection}
          onToggleShowAll={toggleShowAll}
          ownedIds={ownedBusinessIds}
        />
      ))}
    </div>
  );
};
