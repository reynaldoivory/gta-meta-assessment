const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(path.join(__dirname, 'src', 'components')).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove prop-types import
  content = content.replace(/import\s+PropTypes.*?['"]prop-types['"];?\n?/g, '');
  
  const compMatch = file.match(/([A-Za-z0-9_]+)\.jsx$/);
  if (!compMatch) return;
  const compName = compMatch[1];

  // 2. Remove propTypes cleanly using indexOf
  const propTypesStr = `${compName}.propTypes = {`;
  const pIndex = content.indexOf(propTypesStr);
  if (pIndex !== -1) {
    const defaultExportStr = `export default ${compName};`;
    const dIndex = content.indexOf(defaultExportStr, pIndex);
    if (dIndex !== -1) {
        content = content.slice(0, pIndex) + content.slice(dIndex);
    } else {
        // If export default is not found right after, just strip to last };
        const lastBrace = content.lastIndexOf('};\n');
        if (lastBrace > pIndex) {
            content = content.slice(0, pIndex) + content.slice(lastBrace + 3);
        }
    }
  }

  // 3. Add any type to props
  const sigRegex1 = new RegExp(`const\\s+${compName}\\s*=\\s*\\(([^)]*?)\\)\\s*=>`);
  content = content.replace(sigRegex1, (full, inner) => {
      let trimmed = inner.trim();
      if (trimmed === '') return full; // no props
      // If already typed, ignore
      if (trimmed.includes(':') && !trimmed.includes('=')) return full; 
      // This is a naive heuristic: if there's no colon or just default values, type it as any
      return `const ${compName} = (${trimmed}: any) =>`;
  });

  const sigRegex2 = new RegExp(`function\\s+${compName}\\s*\\(([^)]*?)\\)\\s*\\{`);
  content = content.replace(sigRegex2, (full, inner) => {
      let trimmed = inner.trim();
      if (trimmed === '') return full; 
      if (trimmed.includes(':') && !trimmed.includes('=')) return full; 
      return `function ${compName}(${trimmed}: any) {`;
  });
  
  // Also rename file
  const newFile = file.replace(/\.jsx$/, '.tsx');
  fs.writeFileSync(newFile, content);
  fs.unlinkSync(file);
});
console.log('Done migrating to TSX');