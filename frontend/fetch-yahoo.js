const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getYahooImage(query) {
  try {
    const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    
    // Find the first image link
    let img = '';
    $('li.ld a img').each((i, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src');
      if (src && !img) {
        img = src;
      }
    });
    return img;
  } catch (e) {
    return null;
  }
}

async function run() {
  const places = [
    { search: "ร้านอาหาร สวนอาหารริมน้ำ นราธิวาส", img: "/images/places/nr_restaurants_0.jpg" },
    { search: "ร้านอาหารริมน้ำบางปอ นราธิวาส", img: "/images/places/nr_restaurants_1.jpg" },
    { search: "ร้านยะกังโภชนา นราธิวาส", img: "/images/places/nr_restaurants_2.jpg" },
    { search: "ไก่กอและ วงเวียนนก นราธิวาส", img: "/images/places/nr_restaurants_3_gai_golek.jpg" },
    { search: "AKHOO by Nasir นราธิวาส", img: "/images/places/nr_restaurants_4.jpg" },
    { search: "November Cafe นราธิวาส", img: "/images/places/nr_restaurants_6.jpg" },
    { search: "ร้าน Md. นราธิวาส", img: "/images/places/nr_restaurants_8.jpg" },
    { search: "อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง นราธิวาส", img: "/images/places/nr_attractions_1.jpg" },
    { search: "มัสยิดวาดีอัลฮูเซ็น มัสยิด 300 ปี นราธิวาส", img: "/images/places/nr_attractions_2.jpg" },
    { search: "น้ำตกปาโจ นราธิวาส", img: "/images/places/nr_attractions_3.jpg" },
    { search: "ผานับดาว นราธิวาส", img: "/images/places/nr_attractions_4.jpg" },
    { search: "ตลาดน้ำยะกัง นราธิวาส", img: "/images/places/nr_attractions_9.jpg" },
    { search: "ร้านมุมสุขภาพ นราธิวาส", img: "/images/places/nr_souvenirs_1_new.jpg" },
    { search: "ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน นราธิวาส", img: "/images/places/nr_souvenirs_2_new.jpg" },
    { search: "ร้านขายปลากุเลาเค็มตากใบ นราธิวาส", img: "/images/places/nr_souvenirs_3_new.jpg" },
    { search: "ร้านขนมฝรั่งและขนมโบราณย่านยะกัง นราธิวาส", img: "/images/places/nr_souvenirs_4_new.jpg" },
    { search: "ตลาดเช้าเทศบาลเมืองนราธิวาส", img: "/images/places/nr_souvenirs_5_new.jpg" },
    { search: "ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส", img: "/images/places/nr_souvenirs_7.jpg" },
    { search: "ร้านเครื่องสานกระจูดบ้านทอน นราธิวาส", img: "/images/places/nr_souvenirs_8_new.jpg" },
    { search: "ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล นราธิวาส", img: "/images/places/nr_souvenirs_9.jpg" }
  ];

  let fileContent = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');
  let changed = 0;

  for (const place of places) {
    const realImgUrl = await getYahooImage(place.search);
    if (realImgUrl) {
      // replace in fileContent
      const regex = new RegExp(`image:\\s*'${place.img.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}'`, 'g');
      if (fileContent.match(regex)) {
        fileContent = fileContent.replace(regex, `image: '${realImgUrl}'`);
        console.log(`Updated ${place.img} -> ${realImgUrl}`);
        changed++;
      }
    } else {
      console.log(`Failed for ${place.search}`);
    }
    // delay to avoid rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  if (changed > 0) {
    fs.writeFileSync('src/app/provinces/[slug]/page.tsx', fileContent);
    console.log(`Replaced ${changed} images!`);
  }
}

run();
