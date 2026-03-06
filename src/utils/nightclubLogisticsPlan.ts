const SOURCE_RANKING = [
  { id: 'imports', rate: 10000 },
  { id: 'cargo', rate: 8570 },
  { id: 'pharma', rate: 8500 },
  { id: 'sporting', rate: 7500 },
  { id: 'cash', rate: 7000 },
  { id: 'organic', rate: 4500 },
  { id: 'printing', rate: 1500 },
];

export const getNightclubPlan = (formData: any = {}) => {
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