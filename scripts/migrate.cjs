const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Not available? We can use recursive reading

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
  
  // 2. Try to extract propTypes to interface
  const compMatch = file.match(/([A-Za-z0-9_]+)\.jsx$/);
  if (!compMatch) return;
  const compName = compMatch[1];

  const pTypeRegex = new RegExp(`${compName}\\.propTypes\\s*=\\s*\\{([\\s\\S]*?)\\};?`);
  const match = content.match(pTypeRegex);

  let propsInterface = '';
  if (match) {
    // very naive parsing
    const propsInner = match[1];
    const propsLines = propsInner.split('\n').filter(l => l.trim().length > 0);
    let interfaceLines = [];
    propsLines.forEach(l => {
      let line = l.trim();
      if (!line) return;
      // remove comments briefly
      line = line.replace(/\/\/.*/, '');
      const parts = line.split(':');
      if (parts.length < 2) return;
      let propName = parts[0].trim();
      let ptype = parts.slice(1).join(':').trim();
      let optional = !ptype.includes('isRequired');
      
      let tsType = 'any';
      if (ptype.includes('PropTypes.string')) tsType = 'string';
      else if (ptype.includes('PropTypes.number')) tsType = 'number';
      else if (ptype.includes('PropTypes.bool')) tsType = 'boolean';
      else if (ptype.includes('PropTypes.func')) tsType = '(...args: any[]) => any';
      else if (ptype.includes('PropTypes.array')) tsType = 'any[]';
      else if (ptype.includes('PropTypes.object')) tsType = 'Record<string, any>';
      else if (ptype.includes('PropTypes.node')) tsType = 'React.ReactNode';
      else if (ptype.includes('PropTypes.shape')) tsType = 'any'; // Too complex
      else if (ptype.includes('PropTypes.oneOf')) tsType = 'any';
      
      propName = propName.replace(/['"]/g, '');
      interfaceLines.push(`  ${propName}${optional ? '?' : ''}: ${tsType};`);
    });

    if (interfaceLines.length > 0) {
        propsInterface = `\nexport interface ${compName}Props {\n${interfaceLines.join('\n')}\n}\n\n`;
    }
    
    // remove propTypes
    content = content.replace(pTypeRegex, '');
  }

  // insert interface after imports
  if (propsInterface) {
     const lastImportIndex = content.lastIndexOf('import ');
     let index = 0;
     if (lastImportIndex !== -1) {
         index = content.indexOf('\n', lastImportIndex) + 1;
     }
     content = content.slice(0, index) + '\n' + propsInterface + content.slice(index);
  }

  // update signature
  // const MyComponent = ({ prop1, prop2 }) =>
  // to const MyComponent = ({ prop1, prop2 }: MyComponentProps) =>
  if (propsInterface) {
      const sigRegex = new RegExp(`const\\s+${compName}\\s*=\\s*\\(([^)]*)\\)\\s*=>`);
      content = content.replace(sigRegex, `const ${compName} = ($1: ${compName}Props) =>`);
  } else {
      // If props but no interface, add any
      const sigRegex2 = new RegExp(`const\\s+${compName}\\s*=\\s*\\(([^)]*)\\)\\s*=>`);
      // check if it extracts something like { prop1 }
      content = content.replace(sigRegex2, (full, inner) => {
          if (inner.trim() === '') return full; // no props
          return `const ${compName} = (${inner}: any) =>`;
      });
  }

  // add React import if needed for ReactNode
  if (propsInterface.includes('React.ReactNode') && !content.includes('import React')) {
      content = `import React from 'react';\n` + content;
  }

  // Rename file
  const newFile = file.replace(/\.jsx$/, '.tsx');
  fs.writeFileSync(newFile, content);
  fs.unlinkSync(file);
});
console.log('Done migrating to TSX');