const https = require('https');
const http = require('http');

function check(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 6000
      }, res => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.end();
    } catch(e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

const list = [
  // Restaurants
  { id: 'nr_restaurants_0', name: 'สวนอาหารริมน้ำ', image: 'https://img.wongnai.com/p/1920x0/2019/08/23/fe0027b500914dcf8654aa60e30231cb.jpg' },
  { id: 'nr_restaurants_1', name: 'ร้านอาหารริมน้ำบางปอ', image: 'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG' },
  { id: 'nr_restaurants_2', name: 'ร้านยะกังโภชนา', image: 'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG' },
  { id: 'nr_restaurants_3', name: 'ไก่กอและ', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ayam_Percik.jpg/1280px-Ayam_Percik.jpg' },
  { id: 'nr_restaurants_4', name: 'AKHOO by Nasir', image: 'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg' },
  { id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่', image: 'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg' },
  { id: 'nr_restaurants_6', name: 'November Cafe', image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=707910204944199' },
  { id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN', image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881' },
  { id: 'nr_restaurants_8', name: 'ร้าน Md.', image: 'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg' },

  // Attractions
  { id: 'nr_attractions_0', name: 'หาดนราทัศน์', image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B8%A8%E0%B8%99%E0%B9%8C.jpg' },
  { id: 'nr_attractions_1', name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg' },
  { id: 'nr_attractions_2', name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg' },
  { id: 'nr_attractions_3', name: 'น้ำตกปาโจ', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/12/13/20181213d4edc67143bd9837fcb2819fe44dbb66163411.jpg' },
  { id: 'nr_attractions_4', name: 'ผานับดาว', image: 'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG' },
  { id: 'nr_attractions_5', name: 'พระพุทธทักษิณมิ่งมงคล', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg' },
  { id: 'nr_attractions_6', name: 'ชุมชนบ้านทอนและหาดบ้านทอน', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/01/23/20180123d531a89c8a916723fa30973a216db8a1104112.jpg' },
  { id: 'nr_attractions_7', name: 'เทวสถานองค์พระพิฆเนศ', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/02/09/20180209df3427db9133880459a93e3612d4fa94112444.jpg' },
  { id: 'nr_attractions_8', name: 'ศาลเจ้าโก้วเล้งจี่', image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp' },
  { id: 'nr_attractions_9', name: 'ตลาดน้ำยะกัง', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/02/09/20180209930f574d32d966e31005b630e2f5ad45155913.jpg' },

  // Souvenirs
  { id: 'nr_souvenirs_0', name: 'Befish (บีฟิช กรือโป๊ะทอด)', image: 'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg' },
  { id: 'nr_souvenirs_1', name: 'ร้านมุมสุขภาพ นราธิวาส', image: 'https://explorelocalcharm.com/wp-content/uploads/2025/08/unnamed.webp' },
  { id: 'nr_souvenirs_2', name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน', image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588' },
  { id: 'nr_souvenirs_3', name: 'ร้านขายปลากุเลาเค็มตากใบ', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/01/23/201801235cb99479b1bfb9049964177d61245842104523.jpg' },
  { id: 'nr_souvenirs_4', name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/02/09/20180209930f574d32d966e31005b630e2f5ad45155913.jpg' },
  { id: 'nr_souvenirs_5', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/02/09/201802096a6f1d9fa498a444a7f053538c20577d121759.jpg' },
  { id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/01/23/20180123b37996c5aa3ff460f38b488737fb51a6104856.jpg' },
  { id: 'nr_souvenirs_7', name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/01/23/20180123c5e888496bc1dfb37c02b3a4a82759e6105314.jpg' },
  { id: 'nr_souvenirs_8', name: 'ร้านเครื่องสานกระจูดบ้านทอน', image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2018/01/23/20180123d531a89c8a916723fa30973a216db8a1104112.jpg' },
  { id: 'nr_souvenirs_9', name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล', image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=577000211918096' }
];

async function run() {
  console.log('Testing all 29 image URLs...');
  let failed = 0;
  for (const item of list) {
    const res = await check(item.image);
    if (!res.ok) {
      console.log(`FAILED: ${item.name} (${item.image}) -> status=${res.status} error=${res.error}`);
      failed++;
    } else {
      console.log(`OK: ${item.name}`);
    }
  }
  console.log(`\nResult: ${list.length - failed}/${list.length} passed.`);
}
run();
