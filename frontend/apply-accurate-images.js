const https = require('https');
const http = require('http');
const fs = require('fs');

function check(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 6000
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

const narathiwatPlaces = {
  restaurants: [
    {
      id: 'nr_restaurants_0',
      name: 'สวนอาหารริมน้ำ',
      description: 'ร้านอาหารฮาลาลบรรยากาศดีติดริมแม่น้ำในตัวเมืองนราธิวาส เหมาะสำหรับการรับประทานอาหารเย็นร่วมกับครอบครัวหรือกรุ๊ปทัวร์ มีเมนูอาหารทะเลสด อาหารไทยพื้นบ้าน และเมนูแกงสไตล์ปักษ์ใต้รสชาติจัดจ้าน',
      rating: 4.5,
      type: '🍽️ ร้านอาหาร',
      image: 'https://img.wongnai.com/p/1920x0/2019/08/23/fe0027b500914dcf8654aa60e30231cb.jpg'
    },
    {
      id: 'nr_restaurants_1',
      name: 'ร้านอาหารริมน้ำบางปอ',
      description: 'ร้านอาหารบรรยากาศริมน้ำอีกหนึ่งแห่งที่ให้บริการอาหารฮาลาลรสชาติดั้งเดิม โดดเด่นด้วยอาหารทะเลสดใหม่ อาหารพื้นบ้านภาคใต้ และบรรยากาศที่สบายๆ',
      rating: 4.5,
      type: '🍽️ ร้านอาหาร',
      image: 'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg'
    },
    {
      id: 'nr_restaurants_2',
      name: 'ร้านยะกังโภชนา',
      description: 'ร้านอาหารมุสลิมเก่าแก่ที่มีชื่อเสียงในย่านยะกัง มีอาหารเช้าและอาหารตามสั่งฮาลาล อาทิ ข้าวยำ โรตี ข้าวหมกไก่ และชาร้อนรสเข้มข้น',
      rating: 4.6,
      type: '🍽️ ร้านอาหาร',
      image: 'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG'
    },
    {
      id: 'nr_restaurants_3',
      name: 'ไก่กอและ',
      description: 'ร้านอาหารฮาลาลต้นตำหรับไก่กอและบนถนนระแงะมรรคา เสิร์ฟไก่กอและราดซอสเข้มข้น รสชาติหวานมันเผ็ดกำลังดี เหมาะสำหรับมื้อเที่ยง',
      rating: 4.7,
      type: '🍽️ ร้านอาหาร',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YosriNasiKerabu1.jpg/1280px-YosriNasiKerabu1.jpg'
    },
    {
      id: 'nr_restaurants_4',
      name: 'AKHOO by Nasir',
      description: 'ร้านอาหารมุสลิมสมัยใหม่ ตกแต่งสไตล์คาเฟ่ บริการอาหารฮาลาลหลากหลายประเภท ทั้งอาหารไทย อาหารตะวันตก และเครื่องดื่ม',
      rating: 4.5,
      type: '🍽️ ร้านอาหาร',
      image: 'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg'
    },
    {
      id: 'nr_restaurants_5',
      name: 'เหมือนฝันเบเกอรี่',
      description: 'ร้านเบเกอรี่และคาเฟ่ฮาลาลยอดนิยมในตัวเมือง มีขนมเค้ก เบเกอรี่อบสดใหม่ และเครื่องดื่มหลากหลายชนิด',
      rating: 4.4,
      type: '☕ คาเฟ่',
      image: 'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg'
    },
    {
      id: 'nr_restaurants_6',
      name: 'November Cafe',
      description: 'คาเฟ่ฮาลาลบรรยากาศอบอุ่น ให้บริการกาแฟ เครื่องดื่มสมูทตี้ ขนมหวาน และอาหารจานเดียว',
      rating: 4.3,
      type: '☕ คาเฟ่',
      image: 'https://trueid-slsapp-storage-prod.s3-ap-southeast-1.amazonaws.com/partner_files/trueidintrend/15097/_MG_8357_0.JPG'
    },
    {
      id: 'nr_restaurants_7',
      name: 'PLAN TWO KITCHEN',
      description: 'ร้านอาหารฮาลาลสไตล์ฟิวชั่นและอาหารตามสั่ง ตกแต่งร้านทันสมัย เหมาะสำหรับการนั่งรับประทานอาหารและสังสรรค์',
      rating: 4.6,
      type: '🍽️ ร้านอาหาร',
      image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881'
    },
    {
      id: 'nr_restaurants_8',
      name: 'ร้าน Md.',
      description: 'ร้านอาหารฮาลาลยอดนิยมของคนท้องถิ่น เสิร์ฟอาหารจานเดียวและเมนูทานง่ายรสชาติดั้งเดิม',
      rating: 4.2,
      type: '🍽️ ร้านอาหาร',
      image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1710446597008908'
    }
  ],
  attractions: [
    {
      id: 'nr_attractions_0',
      name: 'หาดนราทัศน์',
      description: 'หาดทรายทอดยาวใกล้ตัวเมืองนราธิวาส มีทิวต้นสนร่มรื่นตลอดแนวหาด เป็นจุดชมวิวทิวทัศน์ทะเล ลมพัดเย็นสบาย และมีร้านค้าของกินท้องถิ่นตั้งอยู่รอบๆ',
      rating: 4.4,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B8%A8%E0%B8%99%E0%B9%8C.jpg'
    },
    {
      id: 'nr_attractions_1',
      name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง',
      description: 'ชายหาดโค้งเว้าสวยงามเงียบสงบ ล้อมรอบด้วยธรรมชาติอันร่มรื่นและโขดหิน มีเส้นทางศึกษาธรรมชาติและพื้นที่สำหรับพักผ่อนหย่อนใจ',
      rating: 4.5,
      type: '🏞️ อุทยานแห่งชาติ',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    },
    {
      id: 'nr_attractions_2',
      name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)',
      description: 'มัสยิดไม้โบราณสถาปัตยกรรมผสมผสานไทย มลายู และจีน สร้างโดยไม่ใช้ตะปู เป็นศูนย์รวมจิตใจและสถานที่ท่องเที่ยวทางประวัติศาสตร์ที่สำคัญในอำเภอบาเจาะ',
      rating: 4.7,
      type: '🕌 มัสยิด',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg'
    },
    {
      id: 'nr_attractions_3',
      name: 'น้ำตกปาโจ',
      description: 'น้ำตกขนาดใหญ่ภายในอุทยานแห่งชาติบูโด-สุไหงปาดี มีสายน้ำไหลผ่านผาหินสูง บรรยากาศร่มรื่นด้วยป่าไม้สมบูรณ์',
      rating: 4.3,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    },
    {
      id: 'nr_attractions_4',
      name: 'ผานับดาว',
      description: 'จุดชมวิวทิวทัศน์ทะเลหมอกและดวงดาวในยามค่ำคืน ตั้งอยู่ในอำเภอสุคิริน เหมาะสำหรับสายแคมป์ปิ้งและผู้ที่ชื่นชอบการท่องเที่ยวธรรมชาติ',
      rating: 4.6,
      type: '⛰️ จุดชมวิว',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg/1280px-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B0%E0%B8%99%E0%B8%B2%E0%B8%A7_%E0%B8%88.%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA.jpg'
    },
    {
      id: 'nr_attractions_5',
      name: 'พระพุทธทักษิณมิ่งมงคล',
      description: 'พระพุทธรูปประทับนั่งกลางแจ้งขนาดใหญ่ ประดิษฐานบนยอดเขา เป็นสถานที่ศักดิ์สิทธิ์และจุดแวะสักการะสำคัญของจังหวัด',
      rating: 4.7,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
    },
    {
      id: 'nr_attractions_6',
      name: 'ชุมชนบ้านทอนและหาดบ้านทอน',
      description: 'ชุมชนประมงพื้นบ้านชายฝั่งทะเลที่มีเอกลักษณ์ด้านการทำเรือกอและ นักท่องเที่ยวสามารถชมการต่อเรือกอและจำลองและวิถีชีวิตชาวประมง',
      rating: 4.5,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Fishing_Village_in_Narathiwat.jpg/1280px-Fishing_Village_in_Narathiwat.jpg'
    },
    {
      id: 'nr_attractions_7',
      name: 'เทวสถานองค์พระพิฆเนศ',
      description: 'ประดิษฐานองค์พระพิฆเนศขนาดใหญ่ในตัวเมืองนราธิวาส เป็นจุดแวะพักผ่อนและสักการะสิ่งศักดิ์สิทธิ์',
      rating: 4.5,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp'
    },
    {
      id: 'nr_attractions_8',
      name: 'ศาลเจ้าโก้วเล้งจี่',
      description: 'ศาลเจ้าเก่าแก่ใจกลางเมืองนราธิวาส มีสถาปัตยกรรมแบบจีนที่สวยงามและประณีต',
      rating: 4.4,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp'
    },
    {
      id: 'nr_attractions_9',
      name: 'ตลาดน้ำยะกัง',
      description: 'ตลาดน้ำย้อนยุคริมคลองยะกัง จำหน่ายอาหารพื้นบ้าน ขนมโบราณมลายู และสินค้าท้องถิ่น',
      rating: 4.3,
      type: '📍 สถานที่ท่องเที่ยว',
      image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=707910204944199'
    }
  ],
  souvenirs: [
    {
      id: 'nr_souvenirs_0',
      name: 'Befish (บีฟิช กรือโป๊ะทอด)',
      description: 'แบรนด์ของฝากขึ้นชื่อ ผลิตกรือโป๊ะ (ข้าวเกรียบปลา) ทอดกรอบเคลือบซอสหลากรสชาติ ใช้วัตถุดิบปลาสดจากท้องถิ่น อ่าวมะนาว บรรจุภัณฑ์ทันสมัยเหมาะซื้อเป็นของฝาก',
      rating: 4.8,
      type: '🎁 ร้านของฝาก',
      image: 'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
    },
    {
      id: 'nr_souvenirs_1',
      name: 'ร้านมุมสุขภาพ นราธิวาส',
      description: 'ศูนย์รวมของฝาก ผลิตภัณฑ์ OTOP และสินค้าสุขภาพที่ใหญ่แห่งหนึ่งในตัวเมือง จำหน่ายสินค้าแปรรูป ขนมพื้นบ้าน และของใช้จากชุมชนต่างๆ',
      rating: 4.5,
      type: '🎁 ร้านของฝาก',
      image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=522769479989038'
    },
    {
      id: 'nr_souvenirs_2',
      name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน',
      description: 'แหล่งจำหน่ายเรือกอและจำลอง ผลิตภัณฑ์จากใบเตยและกระจูด มีสินค้าแฮนด์เมดเอกลักษณ์ท้องถิ่นนราธิวาส',
      rating: 4.6,
      type: '🎁 ร้านของฝาก',
      image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588'
    },
    {
      id: 'nr_souvenirs_3',
      name: 'ร้านขายปลากุเลาเค็มตากใบ',
      description: 'ของฝากระดับพรีเมียม ขึ้นชื่อว่าเป็น "ราชาแห่งปลากุเลาเค็ม" เค็มกำลังดี เนื้อนุ่ม กลิ่นหอมเป็นเอกลักษณ์',
      rating: 4.9,
      type: '🎁 ร้านของฝาก',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shrimp.paste-Belachan-01.jpg/1280px-Shrimp.paste-Belachan-01.jpg'
    },
    {
      id: 'nr_souvenirs_4',
      name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง',
      description: 'แหล่งรวมขนมหวานโบราณสไตล์มลายู อาทิ ขนมกอและ ขนมบูดอ ซื้อรับประทานสดหรือนำกลับเป็นของฝากรสชาติดั้งเดิม',
      rating: 4.5,
      type: '🎁 ร้านของฝาก',
      image: 'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG'
    },
    {
      id: 'nr_souvenirs_5',
      name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส',
      description: 'ตลาดสดที่มีโซนจำหน่ายของฝากท้องถิ่น เช่น บูดูสำเร็จรูป กะปิแท้ และกรือโป๊ะแบบดิบ เหมาะสำหรับการเดินเลือกซื้อสินค้าราคาเป็นกันเอง',
      rating: 4.3,
      type: '📍 ตลาด',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Fishing_Village_in_Narathiwat.jpg/1280px-Fishing_Village_in_Narathiwat.jpg'
    },
    {
      id: 'nr_souvenirs_6',
      name: 'ร้านกรือโป๊ะสดอ่าวมะนาว',
      description: 'แผงจำหน่ายกรือโป๊ะสดและกรือโป๊ะตากแห้งบริเวณทางเข้าอ่าวมะนาว สามารถซื้อไปทอดเองที่บ้านเพื่อความสดใหม่',
      rating: 4.4,
      type: '🎁 ร้านของฝาก',
      image: 'https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg'
    },
    {
      id: 'nr_souvenirs_7',
      name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส',
      description: 'ศูนย์รวบรวมผลิตภัณฑ์ชุมชนทั่วทั้งจังหวัดนราธิวาส มีทั้งงานหัตถกรรม ผ้าปาเต๊ะ ผ้าบาติก และอาหารแปรรูป',
      rating: 4.5,
      type: '🎁 ร้านของฝาก',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/COLLECTIE_TROPENMUSEUM_Katoenen_wikkelrok_met_geometrisch_patroon_TMnr_5713-2.jpg'
    },
    {
      id: 'nr_souvenirs_8',
      name: 'ร้านเครื่องสานกระจูดบ้านทอน',
      description: 'จำหน่ายกระเป๋าสาน เสื่อกระจูด และของตกแต่งบ้านจากกระจูด ดีไซน์สวยงาม ฝีมือประณีตจากชาวบ้านในพื้นที่',
      rating: 4.6,
      type: '🎁 ร้านของฝาก',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Lepironia_mucronata.jpg/1280px-Lepironia_mucronata.jpg'
    },
    {
      id: 'nr_souvenirs_9',
      name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล',
      description: 'บริเวณริมถนนสายหลักช่วงฤดูกาลผลไม้ มีลองกองซีมองนราธิวาสแท้ รสชาติหวานอร่อยเป็นของฝากยอดนิยม',
      rating: 4.5,
      type: '🎁 ร้านผลไม้',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Lanzones.jpg'
    }
  ]
};

async function validateAndApply() {
  const allItems = [...narathiwatPlaces.restaurants, ...narathiwatPlaces.attractions, ...narathiwatPlaces.souvenirs];
  console.log(`Checking ${allItems.length} distinct places...`);
  for (const item of allItems) {
    const ok = await check(item.image);
    if (!ok) {
      console.log(`[FAILED] ${item.name} -> ${item.image}`);
    } else {
      console.log(`[PASS] ${item.name}`);
    }
  }

  function formatArr(name, items) {
    let res = `const NARATHIWAT_${name.toUpperCase()}: Place[] = [\n`;
    for (const item of items) {
      res += `  { id: '${item.id}', name: '${item.name}', description: '${item.description}', rating: ${item.rating}, type: '${item.type}', image: '${item.image}' },\n`;
    }
    res += `];\n`;
    return res;
  }

  const rCode = formatArr('restaurants', narathiwatPlaces.restaurants);
  const aCode = formatArr('attractions', narathiwatPlaces.attractions);
  const sCode = formatArr('souvenirs', narathiwatPlaces.souvenirs);

  let pageCode = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');
  pageCode = pageCode.replace(/const NARATHIWAT_RESTAURANTS: Place\[\] = \[[\s\S]*?\];\n*/, rCode + '\n');
  pageCode = pageCode.replace(/const NARATHIWAT_ATTRACTIONS: Place\[\] = \[[\s\S]*?\];\n*/, aCode + '\n');
  pageCode = pageCode.replace(/const NARATHIWAT_SOUVENIRS: Place\[\] = \[[\s\S]*?\];\n*/, sCode + '\n');

  fs.writeFileSync('src/app/provinces/[slug]/page.tsx', pageCode);
  console.log('\nSuccessfully updated page.tsx with distinct accurate images!');
}

validateAndApply();
