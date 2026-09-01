const puppeteer = require('puppeteer');
const fs = require('fs');

async function downloadWithPuppeteer(url, filename) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const response = await page.goto(url, { waitUntil: 'networkidle2' });
  const buffer = await response.buffer();
  fs.writeFileSync(filename, buffer);
  console.log(filename, 'size:', buffer.length);
  
  await browser.close();
}

async function run() {
  await downloadWithPuppeteer('https://s.isanook.com/tr/0/ud/282/1410145/1410145-20201021115201-ab2ed0a.jpg', './public/images/places/nr_souvenirs_0_new.jpg');
  await downloadWithPuppeteer('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kolae_Boat.jpg/1280px-Kolae_Boat.jpg', './public/images/places/nr_souvenirs_2_new.jpg');
  await downloadWithPuppeteer('https://f.ptcdn.info/436/049/000/omuym29fbbgW4Z4r1Y3s-o.jpg', './public/images/places/nr_souvenirs_3_new.jpg');
  await downloadWithPuppeteer('https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lekor.jpg/1200px-Lekor.jpg', './public/images/places/nr_souvenirs_6_new.jpg');
}
run();
