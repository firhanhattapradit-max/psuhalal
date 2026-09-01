const fs = require('fs');
let content = fs.readFileSync('src/app/provinces/[slug]/page.tsx', 'utf8');

const mapping = {
  "/images/places/nr_restaurants_3_gai_golek.jpg": "https://img.wongnai.com/p/1920x0/2021/04/10/4b5e7b94cd374c55920fc1f125f95897.jpg",
  "/images/places/nr_restaurants_4.jpg": "https://img.wongnai.com/p/1920x0/2022/10/22/e1b6f50b44144e5dbf0a0d9e9f69be84.jpg",
  "/images/places/nr_restaurants_6.jpg": "https://img.wongnai.com/p/1920x0/2023/12/10/caafbd7996c94fb1b4b9fbc746f332c8.jpg",
  "/images/places/nr_restaurants_8.jpg": "https://img.wongnai.com/p/1920x0/2024/02/10/583b27b3b7c740398f6d705c93c1f1f2.jpg",
  "/images/places/nr_attractions_1.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ao_Mana_National_Park.jpg/800px-Ao_Mana_National_Park.jpg",
  "/images/places/nr_attractions_2.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/800px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg",
  "/images/places/nr_attractions_3.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bacho_Waterfall.jpg/800px-Bacho_Waterfall.jpg",
  "/images/places/nr_attractions_4.jpg": "https://thailandtourismdirectory.go.th/api/attraction/images/5333/0",
  "/images/places/nr_attractions_9.jpg": "https://th.readme.me/p/37525/cover.jpg",
  "/images/places/nr_souvenirs_4_new.jpg": "https://img.wongnai.com/p/1920x0/2021/04/10/241d720c78be4df2a82ab3002db0cc6b.jpg",
  "/images/places/nr_souvenirs_5_new.jpg": "https://th-test-11.slatic.net/shop/33560ef7b74bdbaab2705e32402d64a2.jpeg",
  "/images/places/nr_souvenirs_7.jpg": "https://th-live-01.slatic.net/p/3b1451fdbbe212da77983cfbb2075558.jpg",
  "/images/places/nr_souvenirs_8_new.jpg": "https://img.wongnai.com/p/1920x0/2020/01/25/a43ce9de958b441fbc05726a261a5f03.jpg",
  "/images/places/nr_souvenirs_9.jpg": "https://images.deliveryhero.io/image/fd-th/LH/o1ky-hero.jpg"
};

let changed = 0;
Object.keys(mapping).forEach(key => {
  const regex = new RegExp(`image:\\s*'${key.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}'`, 'g');
  if (content.match(regex)) {
    content = content.replace(regex, `image: '${mapping[key]}'`);
    changed++;
  }
});

fs.writeFileSync('src/app/provinces/[slug]/page.tsx', content);
console.log(`Manually fixed ${changed} missing images.`);
