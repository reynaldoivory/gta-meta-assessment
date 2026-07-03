interface Source {
  id: string;
  rate: number;
}

const SOURCE_RANKING: Source[] = [
  { id: 'imports', rate: 10000 },
  { id: 'cargo', rate: 8570 },
  { id: 'pharma', rate: 8500 },
  { id: 'sporting', rate: 7500 },
  { id: 'cash', rate: 7000 },
  { id: 'organic', rate: 4500 },
  { id: 'printing', rate: 1500 },
];

interface FormData {
  nightclubSources?: Record<string, boolean>;
  nightclubTechs?: number | string;
}

interface NightclubPlan {
  optimizedIncome: number;
  missedIncome: number;
  techAssignments: string[];
  ownedCount: number;
}

export const getNightclubPlan = (formData: FormData = {}): NightclubPlan => {
  const sources = formData.nightclubSources || {};
  const techs = Number(formData.nightclubTechs) || 0;

  const ownedSources = SOURCE_RANKING.filter((source) => sources[source.id]);
  const assigned = ownedSources.slice(0, techs);
  const optimizedIncome = assigned.reduce((sum, source) => sum + source.rate, 0);
  const missedIncome = ownedSources.length > techs && techs < 5 ? ownedSources[techs]?.rate || 0 : 0;

  return {
    optimizedIncome,
    missedIncome,
    techAssignments: assigned.map((source) => source.id),
    ownedCount: ownedSources.length,
  };
};
