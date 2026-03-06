
import { Check } from 'lucide-react';
import StatBar from './StatBar';

const statLabels = ['Strength', 'Flying', 'Shooting', 'Stealth', 'Driving', 'Stamina'];

const getErrorBorder = (errors, field) => {
  return errors?.[field] ? 'border-gta-red ring-2 ring-gta-red/20' : 'border-gta-green/50';
};

const formatCurrency = (value) => {
  if (!value || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US');
};

export const AssessmentVitalsSidebar = ({
  formData,
  errors,
  handleInputChange,
  handleStatChange,
}: any) => (
  <aside className="col-span-12 lg:col-span-4 space-y-6">
    <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green rounded-lg p-6 shadow-heist">
      <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-1">Operative Vitals</h2>
      <p className="text-xs text-gta-gray">Click bars to adjust</p>
    </div>
    <StatsSection formData={formData} errors={errors} handleStatChange={handleStatChange} />
    <RankCashSection formData={formData} errors={errors} handleInputChange={handleInputChange} />
    <GtaPlusSection formData={formData} handleInputChange={handleInputChange} />
  </aside>
);

const StatsSection = ({ formData, errors, handleStatChange }) => (
  <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
    {statLabels.map(stat => {
      const statKey = stat.toLowerCase();

      return (
        <div key={stat}>
          <StatBar label={stat} value={formData[statKey] || 0} onChange={(val) => handleStatChange(statKey, val)} />
          {errors?.[statKey] && <p className="text-xs text-gta-red mt-1 ml-1">{errors[statKey]}</p>}
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
    <label htmlFor="rank" className="text-xs text-gta-gray font-bold uppercase block mb-2">Rank</label>
    <input
      id="rank"
      name="rank"
      type="number"
      placeholder="0"
      value={formData.rank || ''}
      onChange={handleInputChange}
      className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${getErrorBorder(errors, 'rank')}`}
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
    <label htmlFor="liquidCash" className="text-xs text-gta-gray font-bold uppercase block mb-2">Available Cash</label>
    <div className="relative">
      <input
        id="liquidCash"
        name="liquidCash"
        type="number"
        placeholder="0"
        value={formData.liquidCash || ''}
        onChange={handleInputChange}
        className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${formData.liquidCash && formData.liquidCash !== '0' ? 'text-transparent' : 'text-white'} ${getErrorBorder(errors, 'liquidCash')}`}
      />
      {formData.liquidCash && formData.liquidCash !== '0' && !errors?.liquidCash && (
        <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gta-green font-mono text-lg">
          $ {formatCurrency(formData.liquidCash)}
        </div>
      )}
    </div>
    {errors?.liquidCash && <p className="text-xs text-gta-red mt-1">💢 {errors.liquidCash}</p>}
  </div>
);

LiquidCashInput.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
};

const RankCashSection = ({ formData, errors, handleInputChange }) => (
  <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
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
  <div className={`border-2 rounded-lg p-4 transition-all ${formData.hasGTAPlus ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-purple-500/60' : 'bg-gta-panel border-gta-green/30'}`}>
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name="hasGTAPlus"
        checked={formData.hasGTAPlus || false}
        onChange={handleInputChange}
        className="w-5 h-5 rounded bg-slate-700 border-gta-green checked:bg-purple-500"
      />
      <div className="flex-1">
        <div className="text-white font-bold text-sm">GTA+ Subscriber</div>
        <div className="text-xs text-gta-gray">+$500k/month, bonuses</div>
      </div>
      {formData.hasGTAPlus && <Check className="w-4 h-4 text-gta-green" />}
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
