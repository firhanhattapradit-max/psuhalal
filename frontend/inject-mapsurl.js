const fs = require('fs');

let pageCode = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');

// Function to safely inject mapsUrl to the end of each object in the array
function injectMapsUrls(arrayString, province) {
  // We use regex to match each object in the array
  // { id: '...', name: '...', ... }
  
  return pageCode.replace(new RegExp(`(const ${arrayString}: Place\\[\\] = \\[)([\\s\\S]*?)(];)`, 'g'), (match, p1, p2, p3) => {
    
    let replacedItems = p2.replace(/({[^}]+?)(})/g, (itemMatch, itemInner, itemEnd) => {
      // Check if it already has mapsUrl
      if (itemInner.includes('mapsUrl:')) {
         return itemMatch; // already has
      }
      // Extract the name to construct mapsUrl
      const nameMatch = itemInner.match(/name:\s*'([^']+)'/);
      if (nameMatch) {
         let name = nameMatch[1];
         let mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + province)}`;
         // Special case for ไก่กอและ
         if (name === 'ไก่กอและ') {
           mapsUrl = `https://maps.google.com/?q=${encodeURIComponent('ไก่กอและวงเวียนนก นราธิวาส')}`;
           // Also change the name slightly to match reality better
           itemInner = itemInner.replace(/name:\s*'ไก่กอและ'/, "name: 'ไก่กอและ วงเวียนนก'");
         }
         return `${itemInner}, mapsUrl: '${mapsUrl}' ${itemEnd}`;
      }
      return itemMatch;
    });
    
    return p1 + replacedItems + p3;
  });
}

pageCode = injectMapsUrls('NARATHIWAT_RESTAURANTS', 'นราธิวาส');
pageCode = injectMapsUrls('NARATHIWAT_ATTRACTIONS', 'นราธิวาส');
pageCode = injectMapsUrls('NARATHIWAT_SOUVENIRS', 'นราธิวาส');

fs.writeFileSync('src/app/provinces/[slug]/page.tsx', pageCode);
console.log('Successfully injected mapsUrl for Narathiwat places!');
