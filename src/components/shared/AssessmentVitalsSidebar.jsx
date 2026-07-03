import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import StatBar from './StatBar';
import { formatCurrency } from '../../utils/formatters';

const statLabels = ['Strength', 'Flying', 'Shooting', 'Stealth', 'Driving', 'Stamina'];

const getErrorBorder = (errors, field) => {
  return errors?.[field] ? 'border-hud-pink ring-2 ring-hud-pink/20' : 'border-hud-blue/50';
};

export const AssessmentVitalsSidebar = ({
  formData,
  errors,
  handleInputChange,
  handleStatChange,
}) => (
  <aside className="col-span-12 lg:col-span-4 space-y-6">
    <div className="bg-gradient-to-br from-bg-surface to-bg-base border-2 border-hud-blue rounded-lg p-6 shadow-float">
      <h2 className="text-xl font-bold text-hud-blue font-display uppercase mb-1">Operative Vitals</h2>
      <p className="text-xs text-text-muted">Click bars to adjust</p>
    </div>
    <StatsSection formData={formData} errors={errors} handleStatChange={handleStatChange} />
    <RankCashSection formData={formData} errors={errors} handleInputChange={handleInputChange} />
    <GtaPlusSection formData={formData} handleInputChange={handleInputChange} />
  </aside>
);

const StatsSection = ({ formData, errors, handleStatChange }) => (
  <div className="bg-bg-surface border border-hud-blue/30 rounded-lg p-6 space-y-4">
    {statLabels.map(stat => {
      const statKey = stat.toLowerCase();

      return (
        <div key={stat}>
          <StatBar label={stat} value={formData[statKey] || 0} onChange={(val) => handleStatChange(statKey, val)} />
          {errors?.[statKey] && <p className="text-xs text-accent-pink-text mt-1 ml-1">{errors[statKey]}</p>}
        </div>
      );
    })}
  </div>
);

StatsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleStatChange: PropTypes.func.isRequired,
};

const RankInput = ({ formData, errors, handleInputChange }) => (
  <div>
    <label htmlFor="rank" className="text-xs text-text-muted font-bold uppercase block mb-2">Rank</label>
    <input
      id="rank"
      name="rank"
      type="number"
      placeholder="0"
      value={formData.rank || ''}
      onChange={handleInputChange}
      className={`w-full bg-bg-raised border rounded p-3 focus:border-hud-blue focus:ring-2 focus:ring-hud-blue/20 outline-none transition-colors text-text-primary ${getErrorBorder(errors, 'rank')}`}
      min="0"
      max="8000"
    />
  </div>
);

RankInput.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
};

const LiquidCashInput = ({ formData, errors, handleInputChange }) => (
  <div>
    <label htmlFor="liquidCash" className="text-xs text-text-muted font-bold uppercase block mb-2">Available Cash</label>
    <div className="relative">
      <input
        id="liquidCash"
        name="liquidCash"
        type="number"
        placeholder="0"
        value={formData.liquidCash || ''}
        onChange={handleInputChange}
        className={`w-full bg-bg-raised border rounded p-3 focus:border-hud-blue focus:ring-2 focus:ring-hud-blue/20 outline-none transition-colors ${formData.liquidCash && formData.liquidCash !== '0' ? 'text-transparent' : 'text-text-primary'} ${getErrorBorder(errors, 'liquidCash')}`}
      />
      {formData.liquidCash && formData.liquidCash !== '0' && !errors?.liquidCash && (
        <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-hud-blue font-mono text-lg">
          $ {formatCurrency(formData.liquidCash)}
        </div>
      )}
    </div>
    {errors?.liquidCash && <p className="text-xs text-accent-pink-text mt-1">💢 {errors.liquidCash}</p>}
  </div>
);

LiquidCashInput.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
};

const RankCashSection = ({ formData, errors, handleInputChange }) => (
  <div className="bg-bg-surface border border-hud-blue/30 rounded-lg p-6 space-y-4">
    <RankInput formData={formData} errors={errors} handleInputChange={handleInputChange} />
    <LiquidCashInput formData={formData} errors={errors} handleInputChange={handleInputChange} />
  </div>
);

RankCashSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
};

const GtaPlusSection = ({ formData, handleInputChange }) => (
  <div className={`border-2 rounded-lg p-4 transition-all ${formData.hasGTAPlus ? 'bg-hud-blue/10 border-hud-blue/60' : 'bg-bg-surface border-hud-blue/30'}`}>
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name="hasGTAPlus"
        checked={formData.hasGTAPlus || false}
        onChange={handleInputChange}
        className="w-5 h-5 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
      />
      <div className="flex-1">
        <div className="text-text-primary font-bold text-sm">GTA+ Subscriber</div>
        <div className="text-xs text-text-muted">+$500k/month, bonuses</div>
      </div>
      {formData.hasGTAPlus && <Check className="w-4 h-4 text-hud-blue" />}
    </label>
  </div>
);

GtaPlusSection.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

AssessmentVitalsSidebar.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
  handleStatChange: PropTypes.func.isRequired,
};
