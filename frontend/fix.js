const fs = require('fs');
let code = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"description":') && !lines[i].trim().endsWith('",') && !lines[i].trim().endsWith('"')) {
    lines[i] = lines[i].trimEnd() + '",';
  }
}
fs.writeFileSync('src/app/provinces/[slug]/page.tsx', lines.join('\n'));
console.log('Fixed file');
