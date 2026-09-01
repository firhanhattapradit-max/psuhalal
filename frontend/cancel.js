const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getDDGImage(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' image')}`;
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Firefox/102.0'
      }
    });
    // Find image URL from results (Duckduckgo HTML might not have direct images, but it might have links or thumbnails)
    // Actually DDG html search doesn't show images easily. Let's just use Google images via another method or Wongnai again.
    // Or I can just fetch valid Wikipedia/Travel images.
  } catch (e) {
  }
}
