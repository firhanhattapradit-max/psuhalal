const fs = require('fs');

const file = 'src/app/provinces/[slug]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  {
    find: "name: 'DERNDIN HOUSE', rating: 4.8, type: '🍦 ร้านไอศกรีม / คาเฟ่', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารแนวสร้างสรรค์ที่นำเอาวัตถุดิบและอาหารท้องถิ่นมาแปรรูป', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg'",
    replace: "name: 'DERNDIN HOUSE', rating: 4.8, type: '🍦 ร้านไอศกรีม / คาเฟ่', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารแนวสร้างสรรค์ที่นำเอาวัตถุดิบและอาหารท้องถิ่นมาแปรรูป', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2024/11/02/9ec334578e7649d7a443bcd77710bcbe.jpg'"
  },
  {
    find: "name: 'LEMU.Co - Halal Steakhouse PATTANI', rating: 4.5, type: '🥩 ร้านสเต๊กฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:30 หลังเที่ยง', description: 'ร้านสเต๊กฮาลาลคุณภาพเยี่ยม เอาใจคนรักสายเนื้อ', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881'",
    replace: "name: 'LEMU.Co - Halal Steakhouse PATTANI', rating: 4.5, type: '🥩 ร้านสเต๊กฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:30 หลังเที่ยง', description: 'ร้านสเต๊กฮาลาลคุณภาพเยี่ยม เอาใจคนรักสายเนื้อ', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2024/06/26/93e395fb21524a6eacd3123d4d50fcab.jpg'"
  },
  {
    find: "id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่', description: 'ร้านเบเกอรี่และคาเฟ่ฮาลาลยอดนิยมในตัวเมือง มีขนมเค้ก เบเกอรี่อบสดใหม่ และเครื่องดื่มหลากหลายชนิด', rating: 4.4, type: '☕ คาเฟ่', image: 'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg'",
    replace: "id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่', description: 'ร้านเบเกอรี่และคาเฟ่ฮาลาลยอดนิยมในตัวเมือง มีขนมเค้ก เบเกอรี่อบสดใหม่ และเครื่องดื่มหลากหลายชนิด', rating: 4.4, type: '☕ คาเฟ่', image: 'https://img.wongnai.com/p/1920x0/2016/06/14/dde0ec99568f4e58a9d4ab598e98d053.jpg'"
  },
  {
    find: "id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN', description: 'ร้านอาหารฮาลาลสไตล์ฟิวชั่นและอาหารตามสั่ง ตกแต่งร้านทันสมัย เหมาะสำหรับการนั่งรับประทานอาหารและสังสรรค์', rating: 4.6, type: '🍽️ ร้านอาหาร', image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881'",
    replace: "id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN', description: 'ร้านอาหารฮาลาลสไตล์ฟิวชั่นและอาหารตามสั่ง ตกแต่งร้านทันสมัย เหมาะสำหรับการนั่งรับประทานอาหารและสังสรรค์', rating: 4.6, type: '🍽️ ร้านอาหาร', image: 'https://img.wongnai.com/p/1920x0/2021/04/10/4b5e7b94cd374c55920fc1f125f95897.jpg'"
  },
  {
    find: "id: 'nr_souvenirs_0', name: 'Befish (บีฟิช กรือโป๊ะทอด)', description: 'แบรนด์ของฝากขึ้นชื่อ ผลิตกรือโป๊ะ (ข้าวเกรียบปลา) ทอดกรอบเคลือบซอสหลากรสชาติ ใช้วัตถุดิบปลาสดจากท้องถิ่น อ่าวมะนาว บรรจุภัณฑ์ทันสมัยเหมาะซื้อเป็นของฝาก', rating: 4.8, type: '🎁 ร้านของฝาก', image: '/images/places/nr_souvenirs_0_new.jpg'",
    replace: "id: 'nr_souvenirs_0', name: 'Befish (บีฟิช กรือโป๊ะทอด)', description: 'แบรนด์ของฝากขึ้นชื่อ ผลิตกรือโป๊ะ (ข้าวเกรียบปลา) ทอดกรอบเคลือบซอสหลากรสชาติ ใช้วัตถุดิบปลาสดจากท้องถิ่น อ่าวมะนาว บรรจุภัณฑ์ทันสมัยเหมาะซื้อเป็นของฝาก', rating: 4.8, type: '🎁 ร้านของฝาก', image: 'https://th-live-01.slatic.net/p/3b1451fdbbe212da77983cfbb2075558.jpg'"
  },
  {
    find: "id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', description: 'แผงจำหน่ายกรือโป๊ะสดและกรือโป๊ะตากแห้งบริเวณทางเข้าอ่าวมะนาว สามารถซื้อไปทอดเองที่บ้านเพื่อความสดใหม่', rating: 4.4, type: '🎁 ร้านของฝาก', image: '/images/places/nr_souvenirs_0_new.jpg'",
    replace: "id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', description: 'แผงจำหน่ายกรือโป๊ะสดและกรือโป๊ะตากแห้งบริเวณทางเข้าอ่าวมะนาว สามารถซื้อไปทอดเองที่บ้านเพื่อความสดใหม่', rating: 4.4, type: '🎁 ร้านของฝาก', image: 'https://th-test-11.slatic.net/shop/33560ef7b74bdbaab2705e32402d64a2.jpeg'"
  }
];

let changed = 0;
replacements.forEach(r => {
  if (content.includes(r.find)) {
    content = content.replace(r.find, r.replace);
    changed++;
  } else {
    console.log('Not found:', r.find.substring(0, 50));
  }
});

fs.writeFileSync(file, content);
console.log(`Replaced ${changed} images with real ones.`);
