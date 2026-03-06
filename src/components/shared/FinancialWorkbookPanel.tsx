
import { BookOpen, Calculator, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { financialWorkbookSections, calculateFinancialWorkbookTotals } from '../../utils/financialWorkbookData';

const formatMoney = (value) => `$${value.toLocaleString()}`;

const formatPrice = (entry) => {
  if (entry.costText) return entry.costText;
  if (entry.cost || entry.cost === 0) return formatMoney(entry.cost);
  return null;
};

const getSelectionState = (formData) => formData.financialWorkbookSelections || {};

const toggleItem = (itemId, formData, setFormData) => {
  const current = getSelectionState(formData);
  setFormData((prev) => ({
    ...prev,
    financialWorkbookSelections: {
      ...current,
      [itemId]: !current[itemId],
    },
  }));
};

const clearWorkbook = (setFormData) => {
  setFormData((prev) => ({
    ...prev,
    financialWorkbookSelections: {},
  }));
};

const WorkbookTotals = ({ selections }) => {
  const totals = calculateFinancialWorkbookTotals(selections);

  return (
    <div className="bg-slate-900/60 border border-emerald-500/40 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold">
        <Calculator className="w-4 h-4" /> Financial Workbook Totals
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-black/30 rounded p-3">Businesses: <span className="font-mono text-white">{formatMoney(totals.businesses)}</span></div>
        <div className="bg-black/30 rounded p-3">Vehicles: <span className="font-mono text-white">{formatMoney(totals.vehicles)}</span></div>
        <div className="bg-black/30 rounded p-3">Upgrades: <span className="font-mono text-white">{formatMoney(totals.upgrades)}</span></div>
        <div className="bg-black/30 rounded p-3">Other: <span className="font-mono text-white">{formatMoney(totals.other)}</span></div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700 text-lg font-bold text-emerald-300">
        Grand Total: <span className="font-mono">{formatMoney(totals.grandTotal)}</span>
      </div>
      <div className="text-xs text-slate-400 mt-1">Selected items: {totals.selectedCount}</div>
    </div>
  );
};

WorkbookTotals.propTypes = {
  selections: PropTypes.object.isRequired,
};

const WorkbookSection = ({ section, formData, setFormData, isOpen, onToggle, selectedCount }) => {
  const selections = getSelectionState(formData);

  return (
    <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-4 space-y-3">
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className="w-full text-left"
      >
        <h3 className="text-sm font-bold uppercase text-gta-green">{section.title}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {selectedCount} selected{section.requirement ? ` • ${section.requirement}` : ''}
        </p>
      </button>

      {isOpen && (
        <div className="space-y-2">
          {section.items.map((entry) => {
            const checked = Boolean(selections[entry.id]);
            const warningClass = entry.warning ? 'text-red-300 border-red-700/50 bg-red-950/10' : 'text-slate-200 border-slate-700';

            return (
              <label key={entry.id} className={`flex items-start gap-3 border rounded p-2 ${warningClass}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleItem(entry.id, formData, setFormData)}
                  className="mt-1 w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm">{entry.label}</span>
                    {formatPrice(entry) && (
                      <span className="text-xs font-mono text-gta-green">{formatPrice(entry)}</span>
                    )}
                  </div>
                  {entry.note && <p className="text-xs text-slate-400 mt-1">{entry.note}</p>}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

WorkbookSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    requirement: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  selectedCount: PropTypes.number.isRequired,
};

export const FinancialWorkbookPanel = ({ formData, setFormData }: any) => {
  const selections = getSelectionState(formData);
  const [openSectionIds, setOpenSectionIds] = useState([]);

  const selectedCountBySection = useMemo(() => {
    return Object.fromEntries(
      financialWorkbookSections.map((section) => {
        const count = section.items.reduce((total, entry) => total + (selections[entry.id] ? 1 : 0), 0);
        return [section.id, count];
      })
    );
  }, [selections]);

  const toggleSection = (sectionId) => {
    setOpenSectionIds((prev) => (
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    ));
  };

  return (
    <section className="space-y-4">
      <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-emerald-500/50 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-400 uppercase font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Financial Workbook
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select investments, locations, and upgrades to build your GTA empire budget in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => clearWorkbook(setFormData)}
            className="px-3 py-2 rounded text-xs border border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Workbook
          </button>
        </div>
      </div>

      <WorkbookTotals selections={selections} />

      <div className="space-y-3">
        {financialWorkbookSections.map((section) => (
          <WorkbookSection
            key={section.id}
            section={section}
            formData={formData}
            setFormData={setFormData}
            isOpen={openSectionIds.includes(section.id)}
            onToggle={toggleSection}
            selectedCount={selectedCountBySection[section.id] || 0}
          />
        ))}
      </div>
    </section>
  );
};

FinancialWorkbookPanel.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};
