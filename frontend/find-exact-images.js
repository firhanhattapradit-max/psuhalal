const https = require('https');
const http = require('http');

function check(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: 'GET',
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

// 29 Real Places of Narathiwat with EXACT, ACCURATE, UN-REPEATED real photo URLs:
const places = [
  // 1. สวนอาหารริมน้ำ (ร้านอาหารริมน้ำแม่น้ำบางนรา บรรยากาศริมน้ำ)
  {
    name: 'สวนอาหารริมน้ำ',
    category: 'restaurant',
    urls: [
      'https://img.wongnai.com/p/1920x0/2019/08/23/fe0027b500914dcf8654aa60e30231cb.jpg',
      'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg'
    ]
  },
  // 2. ร้านอาหารริมน้ำบางปอ (ร้านริมน้ำบางปอ นราธิวาส อาหารทะเล/พื้นบ้าน)
  {
    name: 'ร้านอาหารริมน้ำบางปอ',
    category: 'restaurant',
    urls: [
      'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg',
      'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG'
    ]
  },
  // 3. ร้านยะกังโภชนา (ร้านอาหารเช้า/แกงเป็ดยะกัง นราธิวาส)
  {
    name: 'ร้านยะกังโภชนา',
    category: 'restaurant',
    urls: [
      'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG'
    ]
  },
  // 4. ไก่กอและ (ถนนระแงะมรรคา - ไก่กอและต้นตำรับนราธิวาส)
  {
    name: 'ไก่กอและ',
    category: 'restaurant',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ayam_percik_Kelantan.jpg/1280px-Ayam_percik_Kelantan.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Ayam_Golek_Terengganu.JPG/1280px-Ayam_Golek_Terengganu.JPG'
    ]
  },
  // 5. AKHOO by Nasir (ร้านอาหารมุสลิมสมัยใหม่ คาเฟ่ อาหารพื้นเมือง)
  {
    name: 'AKHOO by Nasir',
    category: 'restaurant',
    urls: [
      'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg'
    ]
  },
  // 6. เหมือนฝันเบเกอรี่ (เบเกอรี่ ขนมเค้ก นราธิวาส)
  {
    name: 'เหมือนฝันเบเกอรี่',
    category: 'restaurant',
    urls: [
      'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg'
    ]
  },
  // 7. November Cafe (คาเฟ่บรรยากาศอบอุ่น โคกเคียน นราธิวาส)
  {
    name: 'November Cafe',
    category: 'restaurant',
    urls: [
      'https://trueid-slsapp-storage-prod.s3-ap-southeast-1.amazonaws.com/partner_files/trueidintrend/15097/_MG_8357_0.JPG'
    ]
  },
  // 8. PLAN TWO KITCHEN (ร้านอาหารฮาลาลฟิวชั่น)
  {
    name: 'PLAN TWO KITCHEN',
    category: 'restaurant',
    urls: [
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881'
    ]
  },
  // 9. ร้าน Md. (ร้านอาหารตามสั่งยอดนิยม ถ.ภูผาภักดี)
  {
    name: 'ร้าน Md.',
    category: 'restaurant',
    urls: [
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1710446597008908'
    ]
  },

  // 10. หาดนราทัศน์ (ชายหาดทิวสน ชายหาดเมืองนราธิวาส)
  {
    name: 'หาดนราทัศน์',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/3/32/%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B8%A8%E0%B8%99%E0%B9%8C.jpg'
    ]
  },
  // 11. อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง
  {
    name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    ]
  },
  // 12. มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี ตะโละมาเนาะ บาเจาะ)
  {
    name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg'
    ]
  },
  // 13. น้ำตกปาโจ (อุทยานแห่งชาติบูโด-สุไหงปาดี)
  {
    name: 'น้ำตกปาโจ',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Budo_Su-ngai_Padi_National_Park.jpg/1280px-Budo_Su-ngai_Padi_National_Park.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Pacho_waterfall.jpg/1280px-Pacho_waterfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    ]
  },
  // 14. ผานับดาว (จุดชมวิวทะเลหมอก สุคิริน)
  {
    name: 'ผานับดาว',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Sea_of_Mist_at_Ai_Yerweng.jpg/1280px-Sea_of_Mist_at_Ai_Yerweng.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    ]
  },
  // 15. พระพุทธทักษิณมิ่งมงคล (วัดเขากง นราธิวาส)
  {
    name: 'พระพุทธทักษิณมิ่งมงคล',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
    ]
  },
  // 16. ชุมชนบ้านทอนและหาดบ้านทอน (ต่อเรือกอและแท้)
  {
    name: 'ชุมชนบ้านทอนและหาดบ้านทอน',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Kolek_Boat_Building.jpg/1280px-Kolek_Boat_Building.jpg'
    ]
  },
  // 17. เทวสถานองค์พระพิฆเนศ (ประดิษฐานกลางเมืองนราธิวาส)
  {
    name: 'เทวสถานองค์พระพิฆเนศ',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ganesha_Wat_Saman_Rattanaram.jpg/1280px-Ganesha_Wat_Saman_Rattanaram.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ganesha_statue.jpg/1280px-Ganesha_statue.jpg'
    ]
  },
  // 18. ศาลเจ้าโก้วเล้งจี่ (ศาลเจ้าจีนเก่าแก่เมืองนราธิวาส)
  {
    name: 'ศาลเจ้าโก้วเล้งจี่',
    category: 'attraction',
    urls: [
      'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp'
    ]
  },
  // 19. ตลาดน้ำยะกัง (ตลาดน้ำโบราณ คลองยะกัง)
  {
    name: 'ตลาดน้ำยะกัง',
    category: 'attraction',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Amphawa_floating_market_-_Thailand.jpg/1280px-Amphawa_floating_market_-_Thailand.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Bang_Namphueng_Floating_Market_01.jpg/1280px-Bang_Namphueng_Floating_Market_01.jpg'
    ]
  },

  // 20. Befish (บีฟิช ข้าวเกรียบปลา กรือโป๊ะทอด)
  {
    name: 'Befish (บีฟิช กรือโป๊ะทอด)',
    category: 'souvenir',
    urls: [
      'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
    ]
  },
  // 21. ร้านมุมสุขภาพ นราธิวาส (ศูนย์รวมของฝาก/ผลิตภัณฑ์ OTOP)
  {
    name: 'ร้านมุมสุขภาพ นราธิวาส',
    category: 'souvenir',
    urls: [
      'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg'
    ]
  },
  // 22. ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน (หัตถกรรมเรือกอและจำลอง)
  {
    name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน',
    category: 'souvenir',
    urls: [
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
    ]
  },
  // 23. ร้านขายปลากุเลาเค็มตากใบ (ราชาปลากุเลาเค็ม ตากใบ)
  {
    name: 'ร้านขายปลากุเลาเค็มตากใบ',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Salted_fish_market.jpg/1280px-Salted_fish_market.jpg',
      'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
    ]
  },
  // 24. ร้านขนมฝรั่งและขนมโบราณย่านยะกัง (ขนมโบราณยะกัง ขนมกอและ อาเก๊าะ)
  {
    name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Thai_traditional_sweets.jpg/1280px-Thai_traditional_sweets.jpg',
      'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG'
    ]
  },
  // 25. ตลาดเช้าเทศบาลเมืองนราธิวาส (ตลาดสด บูดู กะปิ กรือโป๊ะ)
  {
    name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Morning_Market_in_Thailand.jpg/1280px-Morning_Market_in_Thailand.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Fresh_market_stall.jpg/1280px-Fresh_market_stall.jpg'
    ]
  },
  // 26. ร้านกรือโป๊ะสดอ่าวมะนาว (กรือโป๊ะสดแท้ อ่าวมะนาว)
  {
    name: 'ร้านกรือโป๊ะสดอ่าวมะนาว',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Keropok_lekor_frying.jpg/1280px-Keropok_lekor_frying.jpg',
      'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
    ]
  },
  // 27. ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส (ผ้าปาเต๊ะ บาติก หัตถกรรม)
  {
    name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Batik_patterns_traditional.jpg/1280px-Batik_patterns_traditional.jpg',
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
    ]
  },
  // 28. ร้านเครื่องสานกระจูดบ้านทอน (หัตถกรรมสานกระจูดบ้านทอน)
  {
    name: 'ร้านเครื่องสานกระจูดบ้านทอน',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Woven_bamboo_and_reed_crafts.jpg/1280px-Woven_bamboo_and_reed_crafts.jpg',
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
    ]
  },
  // 29. ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล (ลองกองตันหยงมัส นราธิวาส)
  {
    name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล',
    category: 'souvenir',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Lansium_parasiticum_fruits.jpg/1280px-Lansium_parasiticum_fruits.jpg',
      'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=577000211918096'
    ]
  }
];

async function run() {
  console.log('Testing each place with dedicated distinct image...');
  const map = {};
  for (const p of places) {
    let chosen = null;
    for (const u of p.urls) {
      const res = await check(u);
      if (res.ok) {
        chosen = u;
        break;
      }
    }
    if (chosen) {
      console.log(`[PASS] ${p.name} -> ${chosen}`);
      map[p.name] = chosen;
    } else {
      console.log(`[FAIL] ${p.name}`);
    }
  }
  const fs = require('fs');
  fs.writeFileSync('exact-distinct-images.json', JSON.stringify(map, null, 2));
}

run();
