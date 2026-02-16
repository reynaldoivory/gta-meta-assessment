import { calculateFinancialWorkbookTotals, financialWorkbookSections } from './financialWorkbookData';

type RecordLike = Record<string, unknown>;

type GuideRow = {
  id: string;
  label: string;
  value: number;
  note?: string;
  editable?: boolean;
  emphasis?: boolean;
};

type GuideSheet = {
  title: string;
  rows: GuideRow[];
};

export type EnterpriseFinancialGuide = {
  balance: GuideSheet;
  income: GuideSheet;
  cashflow: GuideSheet;
};

const num = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const allWorkbookItems = financialWorkbookSections.flatMap((section) => section.items);

const selectedWorkbookItems = (selections: Record<string, boolean>) =>
  allWorkbookItems.filter((entry) => selections[entry.id]);

const hasSelection = (selections: Record<string, boolean>, prefix: string) =>
  Object.keys(selections).some((id) => selections[id] && id.startsWith(prefix));

const hasAnySelection = (selections: Record<string, boolean>, prefixes: string[]) =>
  prefixes.some((prefix) => hasSelection(selections, prefix));

type IncomeFlags = {
  hasKosatka: boolean;
  hasAgency: boolean;
  hasNightclub: boolean;
  hasBunker: boolean;
  hasAcidLab: boolean;
  hasMoneyFronts: boolean;
  hasMCBusiness: boolean;
  hasAnySelection: boolean;
  hasVehicles: boolean;
};

const buildIncomeFlags = (selections: Record<string, boolean>): IncomeFlags => ({
  hasKosatka: hasSelection(selections, 'f1_kosatka'),
  hasAgency: hasSelection(selections, 'c4_agency_'),
  hasNightclub: hasSelection(selections, 'c1_nightclub_'),
  hasBunker: hasSelection(selections, 'c2_bunker_'),
  hasAcidLab: hasAnySelection(selections, ['c3_acid_upgrade_equipment', 'c3_brickade', 'c3_first_dose', 'c3_last_dose']),
  hasMoneyFronts: hasAnySelection(selections, ['b1_car_wash_', 'b2_dispensary_', 'b3_helitours_']),
  hasMCBusiness: hasAnySelection(selections, ['a1_coke_', 'a2_meth_', 'a3_cash_', 'a4_weed_', 'a5_documents_']),
  hasAnySelection: selectedWorkbookItems(selections).length > 0,
  hasVehicles: totalsAnyVehicles(selections),
});

const calculateFrontSafeIncome = (selections: Record<string, boolean>) => {
  const hasCarWash = Boolean(selections.b1_car_wash_la_mesa || selections.b1_car_wash_burton || selections.b1_car_wash_strawberry);
  const hasDispensary = Boolean(selections.b2_dispensary_vinewood || selections.b2_dispensary_rockford || selections.b2_dispensary_del_perro);
  const hasHelitours = Boolean(selections.b3_helitours_lsia || selections.b3_helitours_sandy);

  let total = 0;
  if (hasCarWash) total += 8500;
  if (hasDispensary) total += 5000;
  if (hasHelitours) total += 5000;
  return total;
};

const buildRevenueRows = (formData: RecordLike, flags: IncomeFlags, selections: Record<string, boolean>): GuideRow[] => {
  const activeIncome = num(formData.activeIncomeWorkbook);
  const passiveIncome = num(formData.passiveIncomeWorkbook);
  const cayo = num(formData.cayoIncomeWorkbook);
  const dre = num(formData.dreIncomeWorkbook);
  const payphone = num(formData.payphoneIncomeWorkbook);
  const nightclub = num(formData.nightclubSalesWorkbook);
  const bunker = num(formData.bunkerSalesWorkbook);
  const acid = num(formData.acidSalesWorkbook);
  const moneyFrontSafe = calculateFrontSafeIncome(selections);

  return [
    ...(flags.hasKosatka ? [{ id: 'cayo_revenue', label: 'Cayo Perico Heist Payouts', value: cayo, editable: true }] : []),
    ...(flags.hasAgency ? [{ id: 'dre_revenue', label: 'Dr. Dre Contract Payouts', value: dre, editable: true }] : []),
    ...(flags.hasAgency ? [{ id: 'payphone_revenue', label: 'Payphone Hits / Contracts', value: payphone, editable: true }] : []),
    ...(flags.hasNightclub ? [{ id: 'nightclub_revenue', label: 'Nightclub Warehouse Sales', value: nightclub, editable: true }] : []),
    ...(flags.hasBunker ? [{ id: 'bunker_revenue', label: 'Bunker Sales', value: bunker, editable: true }] : []),
    ...(flags.hasAcidLab ? [{ id: 'acid_revenue', label: 'Acid Lab Sales', value: acid, editable: true }] : []),
    ...(flags.hasMoneyFronts
      ? [{ id: 'moneyfront_safe', label: 'Money Fronts Safe Income', value: moneyFrontSafe, note: 'Auto-derived from selected fronts.' }]
      : []),
    { id: 'manual_active_income', label: 'Additional Active Income', value: activeIncome, editable: true },
    { id: 'manual_passive_income', label: 'Additional Passive Income', value: passiveIncome, editable: true },
  ];
};

const buildExpenseRows = (formData: RecordLike, flags: IncomeFlags): GuideRow[] => {
  const bunkerSupplies = num(formData.bunkerSuppliesWorkbook);
  const acidSupplies = num(formData.acidSuppliesWorkbook);
  const mcSupplies = num(formData.mcSuppliesWorkbook);
  const propertyFees = num(formData.propertyFeesWorkbook);
  const restock = num(formData.restockWorkbook);
  const insurance = num(formData.insuranceWorkbook);

  return [
    ...(flags.hasBunker ? [{ id: 'bunker_supplies', label: 'Bunker Supplies Bought', value: bunkerSupplies, editable: true }] : []),
    ...(flags.hasAcidLab ? [{ id: 'acid_supplies', label: 'Acid Supplies Bought', value: acidSupplies, editable: true }] : []),
    ...(flags.hasMCBusiness ? [{ id: 'mc_supplies', label: 'MC Supplies Bought', value: mcSupplies, editable: true }] : []),
    ...(flags.hasAnySelection ? [{ id: 'property_fees', label: 'Daily Property Fees', value: propertyFees, editable: true }] : []),
    ...(flags.hasVehicles ? [{ id: 'ammo_armor', label: 'Ammo & Armor Restock', value: restock, editable: true }] : []),
    ...(flags.hasVehicles ? [{ id: 'insurance_claims', label: 'Insurance Claims', value: insurance, editable: true }] : []),
  ];
};

const buildBalanceSheet = (formData: RecordLike, selections: Record<string, boolean>): GuideSheet => {
  const totals = calculateFinancialWorkbookTotals(selections);
  const cashOnHand = num(formData.liquidCash);
  const chips = num(formData.casinoChips);
  const selectedAssets = selectedWorkbookItems(selections).filter(
    (entry) => entry.bucket === 'businesses' || entry.bucket === 'vehicles' || entry.bucket === 'upgrades'
  );

  const currentAssets = cashOnHand + chips;
  const fixedAssets = totals.businesses + totals.upgrades;
  const vehicleAssets = totals.vehicles;
  const totalAssets = currentAssets + fixedAssets + vehicleAssets;
  const liabilities = num(formData.workbookDebt);
  const ownerEquity = totalAssets - liabilities;

  const selectedAssetRows: GuideRow[] = selectedAssets.map((entry) => ({
    id: `asset_${entry.id}`,
    label: entry.label,
    value: num(entry.cost),
    note: entry.note,
  }));

  return {
    title: 'Balance Sheet (Net Worth Snapshot)',
    rows: [
      { id: 'cash_on_hand', label: 'Cash on Hand (Maze Bank)', value: cashOnHand, editable: true },
      { id: 'casino_chips', label: 'Casino Chips (Emergency Fund)', value: chips, editable: true },
      { id: 'current_assets_total', label: 'Total Current Assets', value: currentAssets, emphasis: true },
      ...selectedAssetRows,
      { id: 'fixed_assets_total', label: 'Total Fixed Assets', value: fixedAssets, note: 'Derived from selected businesses + upgrades.', emphasis: true },
      { id: 'vehicle_assets_total', label: 'Total Vehicle Assets', value: vehicleAssets, note: 'Derived from selected vehicle assets.', emphasis: true },
      { id: 'total_assets', label: 'TOTAL ASSETS', value: totalAssets, emphasis: true },
      { id: 'liabilities', label: 'Liabilities (Debt)', value: liabilities, editable: true },
      { id: 'owner_equity', label: "OWNER'S EQUITY (Net Worth)", value: ownerEquity, emphasis: true },
    ],
  };
};

const buildIncomeStatement = (formData: RecordLike, selections: Record<string, boolean>): GuideSheet => {
  const flags = buildIncomeFlags(selections);
  const revenueRows = buildRevenueRows(formData, flags, selections);

  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.value, 0);
  const expenseRows = buildExpenseRows(formData, flags);

  const totalExpenses = expenseRows.reduce((sum, row) => sum + row.value, 0);
  const netIncome = totalRevenue - totalExpenses;

  return {
    title: 'Income Statement (Profit & Loss)',
    rows: [
      ...revenueRows,
      { id: 'total_revenue', label: 'TOTAL REVENUE', value: totalRevenue, emphasis: true },
      ...expenseRows,
      { id: 'total_expenses', label: 'TOTAL EXPENSES', value: totalExpenses, emphasis: true },
      { id: 'net_income', label: 'NET INCOME (Profit)', value: netIncome, emphasis: true },
    ],
  };
};

const totalsAnyVehicles = (selections: Record<string, boolean>) =>
  selectedWorkbookItems(selections).some((entry) => entry.bucket === 'vehicles');

const buildCashFlow = (formData: RecordLike, selections: Record<string, boolean>, incomeSheet: GuideSheet): GuideSheet => {
  const netIncome = incomeSheet.rows.find((row) => row.id === 'net_income')?.value || 0;
  const selectedItems = selectedWorkbookItems(selections).filter((entry) => typeof entry.cost === 'number' && num(entry.cost) > 0);
  const investingRows: GuideRow[] = selectedItems.map((entry) => ({
    id: `invest_${entry.id}`,
    label: `CapEx: ${entry.label}`,
    value: -num(entry.cost),
    note: entry.note,
  }));

  const investments = investingRows.reduce((sum, row) => sum + row.value, 0);
  const financing = num(formData.financingWorkbook);
  const beginningCash = num(formData.beginningCashWorkbook);
  const netChange = netIncome + investments + financing;
  const endingCash = beginningCash + netChange;

  return {
    title: 'Statement of Cash Flows (Living Budget)',
    rows: [
      { id: 'ops_net_income', label: 'Net Income (from Income Statement)', value: netIncome, note: 'Auto-linked from net income.' },
      { id: 'ops_total', label: 'Net Cash from Operations', value: netIncome, emphasis: true },
      ...investingRows,
      { id: 'investing_capex', label: 'Net Cash Used in Investing (CapEx)', value: investments, note: 'Auto-derived from selected workbook items.', emphasis: true },
      { id: 'financing', label: 'Net Cash from Financing (External Cash)', value: financing, editable: true },
      { id: 'net_change', label: 'NET CHANGE IN CASH', value: netChange, emphasis: true },
      { id: 'beginning_cash', label: 'Beginning Cash Balance', value: beginningCash, editable: true },
      { id: 'ending_cash', label: 'ENDING CASH BALANCE', value: endingCash, emphasis: true },
    ],
  };
};

export const createEnterpriseFinancialGuide = (formData: RecordLike): EnterpriseFinancialGuide => {
  const selections = (formData.financialWorkbookSelections as Record<string, boolean>) || {};
  const balance = buildBalanceSheet(formData, selections);
  const income = buildIncomeStatement(formData, selections);
  const cashflow = buildCashFlow(formData, selections, income);

  return {
    balance,
    income,
    cashflow,
  };
};
