// src/views/AssessmentForm/StatsSection.tsx
// The 7 stat sliders section

import StatBar from '../../components/shared/StatBar';
import type { AssessmentFormData } from '../../types/domain.types';

interface StatsSectionProps {
  formData: AssessmentFormData;
  errors: Record<string, string>;
  handleStatChange: (key: string, value: number) => void;
}

const STAT_FIELDS = [
  { label: 'Stamina', key: 'stamina' },
  { label: 'Shooting', key: 'shooting' },
  { label: 'Strength', key: 'strength' },
  { label: 'Stealth', key: 'stealth' },
  { label: 'Flying', key: 'flying' },
  { label: 'Driving', key: 'driving' },
  { label: 'Lung Capacity', key: 'lungCapacity' },
] as const;

export function StatsSection({
  formData,
  errors,
  handleStatChange,
}: StatsSectionProps) {
  return (
    <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
      {STAT_FIELDS.map(stat => {
        const statKey = stat.key;
        return (
          <div key={stat.label}>
            <StatBar
              label={stat.label}
              value={formData[statKey] || 0}
              onChange={(val: number) => handleStatChange(statKey, val)}
            />
            {errors?.[statKey] && <p className="text-xs text-gta-red mt-1 ml-1">{errors[statKey]}</p>}
          </div>
        );
      })}
    </div>
  );
}
