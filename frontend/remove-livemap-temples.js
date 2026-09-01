const fs = require('fs');
const path = 'src/components/LiveMap.tsx';
let content = fs.readFileSync(path, 'utf8');

// The lines containing these IDs need to be removed: t1, t2, t10, t12, maybe others?
// Let's remove any line that has 'วัด' or 'ศาลเจ้า'
const lines = content.split('\n');
const newLines = lines.filter(line => {
  if (line.includes('ศาลเจ้า')) return false;
  if (line.includes('วัด')) {
    // but wait, is there 'จังหวัด' (province)? Yes, 'จังหวัด' contains 'วัด'.
    // We only want to remove if it contains 'วัดช้างให้', 'วัดมุจลินท', 'วัดคูหาภิมุข', 'วัดเขากง', 'วัดชลธาราสิงเห'
    if (line.includes('วัดช้างให้') || line.includes('วัดเขากง') || line.includes('วัดชลธาราสิงเห') || line.includes('วัดคูหาภิมุข') || line.includes('วัดมุจลินท')) {
      return false;
    }
  }
  return true;
});

fs.writeFileSync(path, newLines.join('\n'));
console.log('Removed temples from LiveMap.tsx');
