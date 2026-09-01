const axios = require('axios');
const cheerio = require('cheerio');

async function getWongnaiImage(query) {
  try {
    const searchUrl = `https://www.wongnai.com/restaurants?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    
    // Attempt to find the first image in search results
    let imgUrl = '';
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('img.wongnai.com') && !imgUrl) {
        imgUrl = src;
      }
    });
    return imgUrl;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('Muanfun:', await getWongnaiImage('เหมือนฝันเบเกอรี่ นราธิวาส'));
  console.log('Plan Two:', await getWongnaiImage('PLAN TWO KITCHEN นราธิวาส'));
  console.log('Derndin:', await getWongnaiImage('DERNDIN HOUSE ปัตตานี'));
  console.log('Lemu:', await getWongnaiImage('LEMU.Co Halal Steakhouse ปัตตานี'));
}
run();
