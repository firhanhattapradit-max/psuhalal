const fs = require('fs');
const path = 'src/app/provinces/[slug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const toRemove = [
  'บ้านเลขที่ 5 กือดาจีนอ',
  'บ้านขุนพิทักษ์รายา',
  'เมืองโบราณยะรัง',
  'โรงปี๊บ', // not strictly halal
  'LYSM café', // cafe
  'Patani Artspace',
  'อุโมงค์ปิยะมิตร',
  'พระตำหนักทักษิณราชนิเวศน์',
  'ศาลาทรงงาน',
  'สวนสาธารณะสนามช้างเผือก',
  'อุโมงค์เบตงมงคลฤทธิ์' // secular tunnel
];

let lines = content.split('\n');
const newLines = lines.filter(line => {
  for (const r of toRemove) {
    if (line.includes(r)) return false;
  }
  return true;
});

fs.writeFileSync(path, newLines.join('\n'));

// Also check LiveMap.tsx
const liveMapPath = 'src/components/LiveMap.tsx';
let liveMapContent = fs.readFileSync(liveMapPath, 'utf8');
let liveMapLines = liveMapContent.split('\n');
const newLiveMapLines = liveMapLines.filter(line => {
  for (const r of toRemove) {
    if (line.includes(r)) return false;
  }
  return true;
});
fs.writeFileSync(liveMapPath, newLiveMapLines.join('\n'));

console.log('Removed all non-Islamic/secular spots.');
