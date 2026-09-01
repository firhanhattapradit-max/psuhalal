const google = require('googlethis');
const fs = require('fs');

const places = [
  { id: 'nr_restaurants_0', name: 'สวนอาหารริมน้ำ นราธิวาส' },
  { id: 'nr_restaurants_1', name: 'ร้านอาหารริมน้ำบางปอ นราธิวาส' },
  { id: 'nr_restaurants_2', name: 'ร้านยะกังโภชนา นราธิวาส' },
  { id: 'nr_restaurants_3', name: 'ไก่กอและ ถนนระแงะมรรคา นราธิวาส' },
  { id: 'nr_restaurants_4', name: 'AKHOO by Nasir นราธิวาส' },
  { id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่ นราธิวาส' },
  { id: 'nr_restaurants_6', name: 'November Cafe นราธิวาส' },
  { id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN นราธิวาส' },
  { id: 'nr_restaurants_8', name: 'ร้าน Md. นราธิวาส' },
  { id: 'nr_attractions_0', name: 'หาดนราทัศน์ นราธิวาส' },
  { id: 'nr_attractions_1', name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง นราธิวาส' },
  { id: 'nr_attractions_2', name: 'มัสยิดวาดีอัลฮูเซ็น นราธิวาส' },
  { id: 'nr_attractions_3', name: 'น้ำตกปาโจ นราธิวาส' },
  { id: 'nr_attractions_4', name: 'ผานับดาว นราธิวาส' },
  { id: 'nr_attractions_5', name: 'พระพุทธทักษิณมิ่งมงคล นราธิวาส' },
  { id: 'nr_attractions_6', name: 'ชุมชนบ้านทอน นราธิวาส' },
  { id: 'nr_attractions_7', name: 'เทวสถานองค์พระพิฆเนศ นราธิวาส' },
  { id: 'nr_attractions_8', name: 'ศาลเจ้าโก้วเล้งจี่ นราธิวาส' },
  { id: 'nr_attractions_9', name: 'ตลาดน้ำยะกัง นราธิวาส' },
  { id: 'nr_souvenirs_0', name: 'บีฟิช กรือโป๊ะทอด นราธิวาส' },
  { id: 'nr_souvenirs_1', name: 'ร้านมุมสุขภาพ นราธิวาส' },
  { id: 'nr_souvenirs_2', name: 'กลุ่มแม่บ้านเกษตรกรบ้านทอน นราธิวาส' },
  { id: 'nr_souvenirs_3', name: 'ปลากุเลาเค็มตากใบ นราธิวาส' },
  { id: 'nr_souvenirs_4', name: 'ร้านขนมโบราณย่านยะกัง นราธิวาส' },
  { id: 'nr_souvenirs_5', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส' },
  { id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว นราธิวาส' },
  { id: 'nr_souvenirs_7', name: 'ศูนย์ OTOP นราธิวาส' },
  { id: 'nr_souvenirs_8', name: 'ร้านเครื่องสานกระจูดบ้านทอน นราธิวาส' },
  { id: 'nr_souvenirs_9', name: 'ลองกองตันหยงมัส นราธิวาส' }
];

async function run() {
  const options = {
    page: 0, 
    safe: false, // Safe Search
    additional_params: { 
      hl: 'th' 
    }
  };

  const results = {};

  for (const place of places) {
    console.log(`Searching for: ${place.name}`);
    try {
      const response = await google.image(place.name, options);
      if (response && response.length > 0) {
        // Find a valid image URL
        const img = response.find(i => i.url.startsWith('http') && !i.url.includes('fbsbx') && !i.url.includes('lookaside') && !i.url.includes('wikimedia'));
        const finalUrl = img ? img.url : response[0].url;
        results[place.id] = finalUrl;
        console.log(`Found: ${finalUrl}`);
      } else {
        console.log(`Not found.`);
      }
    } catch (e) {
      console.error(e.message);
    }
    // Sleep a bit
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync('google-images-map.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

run();
