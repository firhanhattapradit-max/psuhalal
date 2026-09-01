const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getWongnaiImage(query) {
  try {
    const searchUrl = `https://www.wongnai.com/restaurants?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    let imgUrl = '';
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('img.wongnai.com') && !imgUrl) {
        imgUrl = src.replace('100x100', '1920x0');
      }
    });
    return imgUrl;
  } catch (e) {
    return null;
  }
}

async function getWikiImage(query) {
  try {
    const searchUrl = `https://th.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const res = await axios.get(searchUrl);
    const title = res.data.query.search[0]?.title;
    if (!title) return null;

    const pageUrl = `https://th.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=1000&format=json`;
    const res2 = await axios.get(pageUrl);
    const pages = res2.data.query.pages;
    const pageId = Object.keys(pages)[0];
    return pages[pageId]?.thumbnail?.source || null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const file = 'src/app/provinces/[slug]/page.tsx';
  let content = fs.readFileSync(file, 'utf8');
  let changed = 0;

  const lines = content.split('\n');
  const items = [];
  
  lines.forEach((l) => {
    const match = l.match(/image:\s*'(\/images\/places\/[^']+)'/);
    if (match) {
      const nameMatch = l.match(/name:\s*'([^']+)'/);
      const typeMatch = l.match(/type:\s*'([^']+)'/);
      if (nameMatch) {
        items.push({
          line: l,
          img: match[1],
          name: nameMatch[1],
          type: typeMatch ? typeMatch[1] : ''
        });
      }
    }
  });

  console.log(`Found ${items.length} items to update.`);

  for (const item of items) {
    let newImg = null;
    if (item.type.includes('ร้าน') || item.type.includes('คาเฟ่')) {
      newImg = await getWongnaiImage(item.name + ' นราธิวาส ปัตตานี'); // add keywords to help
    } else {
      newImg = await getWikiImage(item.name);
    }
    
    // Fallback if not found
    if (!newImg && (item.type.includes('ร้าน') || item.type.includes('ตลาด'))) {
        newImg = await getWongnaiImage(item.name);
    }

    if (newImg) {
      console.log(`Found image for ${item.name}: ${newImg}`);
      const regex = new RegExp(`image:\\s*'${item.img.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}'`, 'g');
      content = content.replace(regex, `image: '${newImg}'`);
      changed++;
    } else {
      console.log(`Could not find image for ${item.name}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (changed > 0) {
    fs.writeFileSync(file, content);
    console.log(`Replaced ${changed} images successfully.`);
  }
}

run();
