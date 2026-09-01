const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const places = [
  { id: 'nr_restaurants_0', name: 'สวนอาหารริมน้ำ', type: 'restaurants' },
  { id: 'nr_restaurants_1', name: 'ร้านอาหารริมน้ำบางปอ', type: 'restaurants' },
  { id: 'nr_restaurants_2', name: 'ร้านยะกังโภชนา', type: 'restaurants' },
  { id: 'nr_restaurants_3', name: 'ไก่กอและ', type: 'restaurants' },
  { id: 'nr_restaurants_4', name: 'AKHOO by Nasir', type: 'restaurants' },
  { id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่', type: 'restaurants' },
  { id: 'nr_restaurants_6', name: 'November Cafe', type: 'restaurants' },
  { id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN', type: 'restaurants' },
  { id: 'nr_restaurants_8', name: 'ร้าน Md.', type: 'restaurants' },
  { id: 'nr_attractions_0', name: 'หาดนราทัศน์', type: 'attractions' },
  { id: 'nr_attractions_1', name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง', type: 'attractions' },
  { id: 'nr_attractions_2', name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)', type: 'attractions' },
  { id: 'nr_attractions_3', name: 'น้ำตกปาโจ', type: 'attractions' },
  { id: 'nr_attractions_4', name: 'ผานับดาว', type: 'attractions' },
  { id: 'nr_attractions_5', name: 'พระพุทธทักษิณมิ่งมงคล', type: 'attractions' },
  { id: 'nr_attractions_6', name: 'ชุมชนบ้านทอนและหาดบ้านทอน', type: 'attractions' },
  { id: 'nr_attractions_7', name: 'เทวสถานองค์พระพิฆเนศ', type: 'attractions' },
  { id: 'nr_attractions_8', name: 'ศาลเจ้าโก้วเล้งจี่', type: 'attractions' },
  { id: 'nr_attractions_9', name: 'ตลาดน้ำยะกัง', type: 'attractions' },
  { id: 'nr_souvenirs_0', name: 'Befish (บีฟิช กรือโป๊ะทอด)', type: 'souvenirs' },
  { id: 'nr_souvenirs_1', name: 'ร้านมุมสุขภาพ นราธิวาส', type: 'souvenirs' },
  { id: 'nr_souvenirs_2', name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน', type: 'souvenirs' },
  { id: 'nr_souvenirs_3', name: 'ร้านขายปลากุเลาเค็มตากใบ', type: 'souvenirs' },
  { id: 'nr_souvenirs_4', name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง', type: 'souvenirs' },
  { id: 'nr_souvenirs_5', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส', type: 'souvenirs' },
  { id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', type: 'souvenirs' },
  { id: 'nr_souvenirs_7', name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส', type: 'souvenirs' },
  { id: 'nr_souvenirs_8', name: 'ร้านเครื่องสานกระจูดบ้านทอน', type: 'souvenirs' },
  { id: 'nr_souvenirs_9', name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล', type: 'souvenirs' }
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        if (res.statusCode >= 300) {
          return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        }
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function run() {
  const gmapsImages = JSON.parse(fs.readFileSync('google-maps-images.json', 'utf8'));
  
  let pageCode = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');

  for (const place of places) {
    const url = gmapsImages[place.id];
    if (url) {
      console.log(`Downloading ${place.id}...`);
      const ext = url.includes('.png') ? '.png' : url.includes('.jpeg') ? '.jpg' : url.includes('.webp') ? '.webp' : '.jpg';
      const filepath = path.join(__dirname, 'public', 'images', 'places', `${place.id}${ext}`);
      
      try {
        await downloadImage(url, filepath);
        console.log(`Saved ${filepath}`);
        
        // Update pageCode
        const localUrl = `/images/places/${place.id}${ext}`;
        // We will find the object with this id and replace its image
        const regex = new RegExp(`(id:\\s*'${place.id}'.*?image:\\s*')[^']*(')`);
        pageCode = pageCode.replace(regex, `$1${localUrl}$2`);
      } catch (err) {
        console.error(`Failed to download ${url}: ${err.message}`);
      }
    } else {
      console.log(`No Google Maps image for ${place.id}, skipping download.`);
    }
  }

  fs.writeFileSync('src/app/provinces/[slug]/page.tsx', pageCode);
  console.log('Successfully updated page.tsx to use local Google Maps images!');
}

run();
