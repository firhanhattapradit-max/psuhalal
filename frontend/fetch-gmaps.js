const puppeteer = require('puppeteer');
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
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  const results = {};

  for (const place of places) {
    console.log(`Searching Google Maps for: ${place.name}`);
    try {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      
      // Wait for cover photo button or image to appear
      // Google Maps cover images are usually inside a button with class "aoYhje" or just an img inside it.
      await new Promise(r => setTimeout(r, 4000));
      
      const imageUrl = await page.evaluate(() => {
        // Look for typical Google Maps place cover image
        const img = document.querySelector('button[aria-label^="Photo of"] img') || 
                    document.querySelector('button[aria-label^="รูปภาพของ"] img') ||
                    document.querySelector('.aoYhje img') || 
                    document.querySelector('img[decoding="async"][src^="https://lh3.googleusercontent.com/p/"]') ||
                    document.querySelector('img[src^="https://lh5.googleusercontent.com/p/"]');
        
        if (img) {
          let src = img.getAttribute('src');
          // Replace size parameters to get a larger image, usually w400-h300 or similar
          if (src) {
             src = src.replace(/=w\d+-h\d+-k-no/, '=w800-h600-k-no');
          }
          return src;
        }
        return null;
      });

      if (imageUrl) {
        results[place.id] = imageUrl;
        console.log(`Found: ${imageUrl}`);
      } else {
        console.log(`Not found.`);
      }
    } catch (err) {
      console.error(`Error:`, err.message);
    }
  }

  await browser.close();
  
  fs.writeFileSync('google-maps-images.json', JSON.stringify(results, null, 2));
  console.log('Done! Results saved to google-maps-images.json');
}

run();
