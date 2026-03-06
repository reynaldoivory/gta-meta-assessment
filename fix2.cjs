const fs = require('fs');

function fix(f) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.endsWith('export default ROICalculator;')) {
    content = content.replace(/<\/div>\n  <\/div>\nexport default/, '    </div>\n  </div>\n  );\n};\nexport default');
  } else if (f.includes('EmpireProgressPanel')) {
    content = content.replace(/<\/div>\n  <\/div>\nexport default/, '    </div>\n  </div>\n  );\n};\nexport default');
  } else if (f.includes('ProgressChart')) {
    content = content.replace(/<\/div>\n  <\/div>\nexport default/, '    </div>\n  </div>\n  );\n};\nexport default');
  } else if (f.includes('ActionCard')) {
    content = content.replace(/<\/div>\n  <\/div>\nexport default/, '    </div>\n  </div>\n  );\n};\nexport default');
  } else if (f.includes('SessionCard')) {
    content = content.replace(/\),\n\};$/, 'export default SessionCard;');
  }
  fs.writeFileSync(f, content);
}

fix('src/components/calculators/ROICalculator.tsx');
fix('src/components/gamification/EmpireProgressPanel.tsx');
fix('src/components/gamification/ProgressChart.tsx');
fix('src/components/shared/ActionCard.tsx');
fix('src/components/shared/SessionCard.tsx');
console.log('Fixed syntax issues manually');