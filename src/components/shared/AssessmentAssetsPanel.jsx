import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';
import NightclubLogistics from './NightclubLogistics';
import { TrapBlockingWarning } from './TrapWarnings';
import { AssetToggleCard } from './AssetToggleCard';

const createCheckboxEvent = (name, checked) => ({
  target: { name, type: 'checkbox', checked },
});

const getToggleHandler = (name, formData, handleInputChange) => () => {
  handleInputChange(createCheckboxEvent(name, !formData[name]));
};

const vehicleAssets = [
  { key: 'hasOppressor', label: 'Oppressor Mk II', emoji: '🏍️', cost: '$6.8M' },
  { key: 'hasRaiju', label: 'F-160 Raiju', emoji: '✈️', cost: '$6.8M' },
  { key: 'hasArmoredKuruma', label: 'Armored Kuruma', emoji: '🛡️', cost: '$1.532M' },
  { key: 'hasBrickade6x6', label: 'Brickade 6x6', emoji: '🚚', cost: '$650k' },
];

const propertyAssets = [
  { key: 'hasAgency', label: 'Agency', emoji: '🕵️', cost: '$2.025M' },
  { key: 'hasArcade', label: 'Arcade', emoji: '🎮', cost: '$672k+' },
  { key: 'hasMansion', label: 'Mansion', emoji: '🏰', cost: '$4.65M' },
  { key: 'hasCarWash', label: 'Car Wash', emoji: '🚗', cost: '$290k' },
];

const TrapAlerts = ({ cascadeTraps, criticalTraps, hasCriticalTrap }) => (
  <>
    {cascadeTraps.length > 0 && (
      <div className="space-y-3">
        {cascadeTraps.map(trap => (
          <TrapBlockingWarning key={trap.id} trap={trap} />
        ))}
      </div>
    )}

    {hasCriticalTrap && !cascadeTraps.length && (
      <div className="p-4 bg-gta-red/10 border-2 border-gta-red rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-gta-red flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gta-red mb-1">
              ⚠️ {criticalTraps.length} Critical Issue{criticalTraps.length === 1 ? '' : 's'}
            </h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {criticalTraps.map(trap => (
                <li key={trap.id}>• {trap.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}
  </>
);

TrapAlerts.propTypes = {
  cascadeTraps: PropTypes.arrayOf(PropTypes.object).isRequired,
  criticalTraps: PropTypes.arrayOf(PropTypes.object).isRequired,
  hasCriticalTrap: PropTypes.bool.isRequired,
};

const AssetGridSection = ({ title, assets, formData, handleInputChange }) => (
  <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6">
    <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-4">{title}</h3>
    <div className="grid grid-cols-2 gap-3">
      {assets.map(asset => (
        <AssetToggleCard
          key={asset.key}
          label={asset.label}
          emoji={asset.emoji}
          cost={asset.cost}
          isOwned={formData[asset.key] || false}
          onChange={getToggleHandler(asset.key, formData, handleInputChange)}
          compact
        />
      ))}
    </div>
  </div>
);

AssetGridSection.propTypes = {
  title: PropTypes.string.isRequired,
  assets: PropTypes.arrayOf(PropTypes.object).isRequired,
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const KosatkaCard = ({ formData, handleInputChange }) => (
  <AssetToggleCard
    label="Kosatka Submarine"
    emoji="🚢"
    cost="$2.2M"
    isOwned={formData.hasKosatka || false}
    onChange={getToggleHandler('hasKosatka', formData, handleInputChange)}
  >
    {formData.hasKosatka && (
      <label className="flex items-center gap-3 ml-6 p-2 cursor-pointer">
        <input
          type="checkbox"
          name="hasSparrow"
          checked={formData.hasSparrow || false}
          onChange={handleInputChange}
          className="w-4 h-4 rounded bg-slate-700 border-gta-green checked:bg-gta-green"
        />
        <span className="text-xs text-gta-gray">+ Sparrow Helicopter ($1.8M)</span>
      </label>
    )}
  </AssetToggleCard>
);

KosatkaCard.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const AcidLabCard = ({ formData, handleInputChange }) => (
  <AssetToggleCard
    label="Acid Lab"
    emoji="🧪"
    cost="$750k"
    isOwned={formData.hasAcidLab || false}
    onChange={getToggleHandler('hasAcidLab', formData, handleInputChange)}
  >
    {formData.hasAcidLab && (
      <label className="flex items-center gap-3 ml-6 p-2 cursor-pointer">
        <input
          type="checkbox"
          name="acidLabUpgraded"
          checked={formData.acidLabUpgraded || false}
          onChange={handleInputChange}
          className="w-4 h-4 rounded bg-slate-700 border-gta-green checked:bg-gta-green"
        />
        <span className="text-xs text-gta-gray">Equipment Upgrade ($250k)</span>
      </label>
    )}
  </AssetToggleCard>
);

AcidLabCard.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const BunkerCard = ({ formData, handleInputChange }) => (
  <AssetToggleCard
    label="Bunker"
    emoji="🔫"
    cost="$1.375M"
    isOwned={formData.hasBunker || false}
    onChange={getToggleHandler('hasBunker', formData, handleInputChange)}
  >
    {formData.hasBunker && (
      <div className="ml-6 space-y-2">
        <label className="flex items-center gap-3 p-2 cursor-pointer">
          <input
            type="checkbox"
            name="bunkerEquipmentUpgrade"
            checked={formData.bunkerEquipmentUpgrade || false}
            onChange={handleInputChange}
            className="w-4 h-4 rounded bg-slate-700 border-gta-green checked:bg-gta-green"
          />
          <span className="text-xs text-gta-gray">Equipment Upgrade ($550k)</span>
        </label>
        <label className="flex items-center gap-3 p-2 cursor-pointer">
          <input
            type="checkbox"
            name="bunkerStaffUpgrade"
            checked={formData.bunkerStaffUpgrade || false}
            onChange={handleInputChange}
            className="w-4 h-4 rounded bg-slate-700 border-gta-green checked:bg-gta-green"
          />
          <span className="text-xs text-gta-gray">Staff Upgrade ($550k)</span>
        </label>
      </div>
    )}
  </AssetToggleCard>
);

BunkerCard.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const NightclubCard = ({ formData, handleInputChange, setFormData }) => (
  <AssetToggleCard
    label="Nightclub"
    emoji="🎭"
    cost="$1.7M - $3.1M"
    isOwned={formData.hasNightclub || false}
    onChange={getToggleHandler('hasNightclub', formData, handleInputChange)}
  >
    {formData.hasNightclub && <NightclubLogistics formData={formData} setFormData={setFormData} />}
  </AssetToggleCard>
);

NightclubCard.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
};

const IncomeProducersSection = ({ formData, handleInputChange, setFormData }) => (
  <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-3">
    <h3 className="text-lg font-bold text-gta-green font-heading uppercase">💰 Income Producers</h3>
    <KosatkaCard formData={formData} handleInputChange={handleInputChange} />
    <AcidLabCard formData={formData} handleInputChange={handleInputChange} />
    <BunkerCard formData={formData} handleInputChange={handleInputChange} />
    <NightclubCard formData={formData} handleInputChange={handleInputChange} setFormData={setFormData} />
    <AssetToggleCard
      label="Auto Shop"
      emoji="🔧"
      cost="$835k"
      details="Union Depository: ~$600k per run"
      isOwned={formData.hasAutoShop || false}
      onChange={getToggleHandler('hasAutoShop', formData, handleInputChange)}
    />
  </div>
);

IncomeProducersSection.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export const AssessmentAssetsPanel = ({
  formData,
  handleInputChange,
  setFormData,
  cascadeTraps,
  criticalTraps,
  hasCriticalTrap,
}) => (
  <>
    <TrapAlerts
      cascadeTraps={cascadeTraps}
      criticalTraps={criticalTraps}
      hasCriticalTrap={hasCriticalTrap}
    />
    <IncomeProducersSection
      formData={formData}
      handleInputChange={handleInputChange}
      setFormData={setFormData}
    />
    <AssetGridSection
      title="🏍️ Vehicles & Tools"
      assets={vehicleAssets}
      formData={formData}
      handleInputChange={handleInputChange}
    />
    <AssetGridSection
      title="🏢 Properties & Services"
      assets={propertyAssets}
      formData={formData}
      handleInputChange={handleInputChange}
    />
  </>
);

AssessmentAssetsPanel.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  cascadeTraps: PropTypes.arrayOf(PropTypes.object).isRequired,
  criticalTraps: PropTypes.arrayOf(PropTypes.object).isRequired,
  hasCriticalTrap: PropTypes.bool.isRequired,
};
