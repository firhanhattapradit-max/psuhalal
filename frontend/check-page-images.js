const fs = require('fs');
const https = require('https');
const http = require('http');

function check(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 5000
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

async function verifyPage() {
  const content = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');
  const naraSection = content.substring(content.indexOf('const NARATHIWAT_RESTAURANTS'), content.indexOf('const YALA_RESTAURANTS'));
  
  const regex = /image:\s*['"]([^'"]+)['"]/g;
  let m;
  const urls = [];
  while ((m = regex.exec(naraSection)) !== null) {
    urls.push(m[1]);
  }
  
  console.log(`Found ${urls.length} images in Narathiwat section.`);
  let failed = 0;
  for (let i = 0; i < urls.length; i++) {
    const res = await check(urls[i]);
    if (!res.ok) {
      console.log(`[FAIL ${i + 1}] ${urls[i]} -> status=${res.status}`);
      failed++;
    } else {
      console.log(`[PASS ${i + 1}] ${urls[i]}`);
    }
  }
  console.log(`\nFinal result: ${urls.length - failed}/${urls.length} valid!`);
}

verifyPage();
