// src/components/shared/NightclubLogistics.jsx
// Smart Nightclub technician assignment with real-time income calculation

import { SourceSelectorGrid, TechnicianSelector, InsightsPanel } from './NightclubLogisticsSections';
import { getNightclubPlan } from '../../utils/nightclubLogisticsPlan';

export default function NightclubLogistics({ formData, setFormData }: any) {
  const toggleSource = (sourceId) => {
    setFormData((prev) => ({
      ...prev,
      nightclubSources: {
        ...prev.nightclubSources,
        [sourceId]: !prev.nightclubSources?.[sourceId],
      },
    }));
  };

  const setTechs = (num) => {
    setFormData((prev) => ({ ...prev, nightclubTechs: num }));
  };

  const { optimizedIncome, missedIncome, techAssignments, ownedCount } = getNightclubPlan(formData);
  const currentTechs = Number(formData.nightclubTechs) || 0;

  return (
    <div className="space-y-4">
      <SourceSelectorGrid
        formData={formData}
        currentTechs={currentTechs}
        techAssignments={techAssignments}
        onToggleSource={toggleSource}
      />

      <TechnicianSelector currentTechs={currentTechs} ownedCount={ownedCount} onSetTechs={setTechs} />

      <InsightsPanel
        optimizedIncome={optimizedIncome}
        ownedCount={ownedCount}
        currentTechs={currentTechs}
        missedIncome={missedIncome}
      />
    </div>
  );
}

NightclubLogistics.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};
