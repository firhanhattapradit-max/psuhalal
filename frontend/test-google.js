const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

const queries = ['หาดนราทัศน์', 'มัสยิดวาดีอัลฮูเซ็น 300 ปี', 'น้ำตกปาโจ', 'หาดอ่าวมะนาว นราธิวาส'];

async function searchGoogle(q) {
  try {
    const res = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    // Google embeds images in script tags like [1,[0,"id",["https://encrypted...
    const matches = res.data.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^\"\']+/g);
    return matches ? matches[0] : null;
  } catch(e) {
    return null;
  }
}

async function test() {
  for (const q of queries) {
    const url = await searchGoogle(q);
    console.log(q, url);
  }
}
test();
