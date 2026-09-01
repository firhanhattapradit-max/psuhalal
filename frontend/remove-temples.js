const fs = require('fs');

let content = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');

// Regex to remove specific lines.
const linesToRemove = [
  // Pattani
  /.*ศาลเจ้าแม่ลิ้มกอเหนี่ยว.*\n/g,
  /.*วัดช้างให้ราษฎร์บูรณาราม.*\n/g,
  /.*วัดมุจลินทวาปีวิหาร.*\n/g,
  
  // Narathiwat
  /.*พระพุทธทักษิณมิ่งมงคล.*\n/g,
  /.*เทวสถานองค์พระพิฆเนศ.*\n/g,
  /.*ศาลเจ้าโก้วเล้งจี่.*\n/g,
  
  // Yala
  /.*วัดคูหาภิมุข.*\n/g,
  /.*ศาลเจ้าพ่อหลักเมืองจังหวัดยะลา.*\n/g
];

for (const regex of linesToRemove) {
  content = content.replace(regex, '');
}

fs.writeFileSync('src/app/provinces/[slug]/page.tsx', content);
console.log('Removed temples and shrines.');
