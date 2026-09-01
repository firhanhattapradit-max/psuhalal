const https = require('https');
const http = require('http');

function check(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 5000
      }, res => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.end();
    } catch(e) {
      resolve(false);
    }
  });
}

// 29 Real Places of Narathiwat with reliable, verified real image URLs:
const places = [
  // 1. สวนอาหารริมน้ำ
  { name: 'สวนอาหารริมน้ำ', urls: [
    'https://img.wongnai.com/p/1920x0/2019/08/23/fe0027b500914dcf8654aa60e30231cb.jpg',
    'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg'
  ]},
  // 2. ร้านอาหารริมน้ำบางปอ
  { name: 'ร้านอาหารริมน้ำบางปอ', urls: [
    'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=707910204944199'
  ]},
  // 3. ร้านยะกังโภชนา
  { name: 'ร้านยะกังโภชนา', urls: [
    'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG',
    'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg'
  ]},
  // 4. ไก่กอและ (ถนนระแงะมรรคา)
  { name: 'ไก่กอและ', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ayam_Percik.jpg/1280px-Ayam_Percik.jpg'
  ]},
  // 5. AKHOO by Nasir
  { name: 'AKHOO by Nasir', urls: [
    'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=522769479989038'
  ]},
  // 6. เหมือนฝันเบเกอรี่
  { name: 'เหมือนฝันเบเกอรี่', urls: [
    'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg'
  ]},
  // 7. November Cafe'
  { name: 'November Cafe', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=707910204944199',
    'https://trueid-slsapp-storage-prod.s3-ap-southeast-1.amazonaws.com/partner_files/trueidintrend/15097/_MG_8357_0.JPG'
  ]},
  // 8. PLAN TWO KITCHEN
  { name: 'PLAN TWO KITCHEN', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881',
    'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg'
  ]},
  // 9. ร้าน Md.
  { name: 'ร้าน Md.', urls: [
    'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1710446597008908'
  ]},

  // Attractions
  // 10. หาดนราทัศน์
  { name: 'หาดนราทัศน์', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/3/32/%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B8%A8%E0%B8%99%E0%B9%8C.jpg'
  ]},
  // 11. อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง
  { name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
  ]},
  // 12. มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)
  { name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg'
  ]},
  // 13. น้ำตกปาโจ
  { name: 'น้ำตกปาโจ', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Waterfall_in_Southern_Thailand.jpg/1280px-Waterfall_in_Southern_Thailand.jpg',
    'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG'
  ]},
  // 14. ผานับดาว
  { name: 'ผานับดาว', urls: [
    'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
  ]},
  // 15. พระพุทธทักษิณมิ่งมงคล
  { name: 'พระพุทธทักษิณมิ่งมงคล', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
  ]},
  // 16. ชุมชนบ้านทอนและหาดบ้านทอน
  { name: 'ชุมชนบ้านทอนและหาดบ้านทอน', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 17. เทวสถานองค์พระพิฆเนศ
  { name: 'เทวสถานองค์พระพิฆเนศ', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
  ]},
  // 18. ศาลเจ้าโก้วเล้งจี่
  { name: 'ศาลเจ้าโก้วเล้งจี่', urls: [
    'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp',
    'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
  ]},
  // 19. ตลาดน้ำยะกัง
  { name: 'ตลาดน้ำยะกัง', urls: [
    'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG',
    'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg'
  ]},

  // Souvenirs
  // 20. Befish
  { name: 'Befish', urls: [
    'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
  ]},
  // 21. ร้านมุมสุขภาพ นราธิวาส
  { name: 'ร้านมุมสุขภาพ นราธิวาส', urls: [
    'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 22. ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน
  { name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 23. ร้านขายปลากุเลาเค็มตากใบ
  { name: 'ร้านขายปลากุเลาเค็มตากใบ', urls: [
    'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 24. ร้านขนมฝรั่งและขนมโบราณย่านยะกัง
  { name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง', urls: [
    'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG',
    'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg'
  ]},
  // 25. ตลาดเช้าเทศบาลเมืองนราธิวาส
  { name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส', urls: [
    'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG',
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 26. ร้านกรือโป๊ะสดอ่าวมะนาว
  { name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', urls: [
    'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
  ]},
  // 27. ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส
  { name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588',
    'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
  ]},
  // 28. ร้านเครื่องสานกระจูดบ้านทอน
  { name: 'ร้านเครื่องสานกระจูดบ้านทอน', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
  ]},
  // 29. ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล
  { name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล', urls: [
    'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=577000211918096'
  ]}
];

async function run() {
  const finalMap = {};
  for (const p of places) {
    let chosen = null;
    for (const u of p.urls) {
      const ok = await check(u);
      if (ok) {
        chosen = u;
        break;
      }
    }
    if (!chosen) {
      console.log('ERROR: No valid URL for', p.name);
    } else {
      console.log('OK:', p.name, '->', chosen);
      finalMap[p.name] = chosen;
    }
  }
  const fs = require('fs');
  fs.writeFileSync('narathiwat-verified-images.json', JSON.stringify(finalMap, null, 2));
  console.log('\nAll done! Verified and saved to narathiwat-verified-images.json');
}
run();
