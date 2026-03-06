const fs = require('fs');

const files = [
  'src/components/calculators/ROICalculator.tsx',
  'src/components/calculators/SocialCardGenerator.tsx',
  'src/components/gamification/EmpireProgressPanel.tsx',
  'src/components/gamification/ProgressChart.tsx',
  'src/components/shared/ActionCard.tsx',
  'src/components/shared/SessionCard.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Strip any remaining PropTypes block at the end
  content = content.replace(/\n\),[\s\S]*?(?=\nexport default)/, '');
  content = content.replace(/\n\)[^]*?(?=\nexport default)/, '');
  fs.writeFileSync(f, content);
});
console.log('Fixed trailing PropTypes');