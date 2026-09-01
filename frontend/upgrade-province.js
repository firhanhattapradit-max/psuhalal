const fs = require('fs');

const path = 'src/app/provinces/[slug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject framer-motion import
if (!content.includes("import { motion }")) {
  content = content.replace("import { notFound } from 'next/navigation';", "import { notFound } from 'next/navigation';\nimport { motion } from 'framer-motion';");
}

// Upgrade PlaceCard
const oldPlaceCardRegex = /const PlaceCard = \(\{ place \}: \{ place: Place \}\) => \([\s\S]*?<\/div>\n\);\n/;
const newPlaceCard = `const PlaceCard = ({ place, index = 0 }: { place: Place, index?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-slate-700/50 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(52,211,153,0.3)] transition-all duration-500 group flex flex-col h-full hover:-translate-y-2 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-100/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:z-0"
  >
    <div className="z-10 flex flex-col flex-1 h-full">
      {place.image && (
        <div className="relative h-56 w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-lg text-sm font-black text-emerald-800 z-20">
            <Star className="w-4 h-4 text-amber-500 mr-1.5 fill-amber-500 group-hover:animate-spin" style={{ animationIterationCount: 1, animationDuration: '0.5s' }} />
            {place.rating}
          </div>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{place.type}</div>
          {!place.image && (
            <div className="flex items-center text-sm font-black text-slate-700 dark:text-slate-300">
              <Star className="w-4 h-4 text-amber-500 mr-1 fill-amber-500" />
              {place.rating}
            </div>
          )}
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{place.name}</h3>
        {place.status && (
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold bg-slate-100 dark:bg-slate-800 w-fit px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {place.status}
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed font-light">{place.description}</p>
        <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-700/50">
          <a href={\`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(place.name + ' ประเทศไทย')}\`} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden flex items-center justify-center w-full bg-gradient-to-r from-slate-100 to-slate-50 hover:from-emerald-50 hover:to-teal-50 dark:from-slate-700 dark:to-slate-800 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 text-slate-700 dark:text-white py-3 rounded-2xl font-bold transition-all duration-300 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-300 shadow-sm hover:shadow-md">
            <MapPin className="w-4 h-4 mr-2 group-hover:-translate-y-1 group-hover:text-emerald-500 transition-transform" />
            นำทางด้วย Google Maps
            <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 group-hover:text-emerald-500 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  </motion.div>
);
`;

content = content.replace(oldPlaceCardRegex, newPlaceCard);

// Also upgrade the mapping to include index.
content = content.replace(/\{province.restaurants.map\(place => <PlaceCard key=\{place.id\} place=\{place\} \/>\)\}/g, 
  `{province.restaurants.map((place, i) => <PlaceCard key={place.id} place={place} index={i} />)}`);
content = content.replace(/\{province.attractions.map\(place => <PlaceCard key=\{place.id\} place=\{place\} \/>\)\}/g, 
  `{province.attractions.map((place, i) => <PlaceCard key={place.id} place={place} index={i} />)}`);
content = content.replace(/\{province.souvenirs.map\(place => <PlaceCard key=\{place.id\} place=\{place\} \/>\)\}/g, 
  `{province.souvenirs.map((place, i) => <PlaceCard key={place.id} place={place} index={i} />)}`);

// Upgrade Hero Section of Province
const heroRegex = /<div className=\{`w-full h-\[400px\] relative flex items-center justify-center bg-\$\{province\.color\}-800`\} style=\{province\.coverImage \? \{ backgroundImage: `linear-gradient\(rgba\(0,0,0,0\.4\), rgba\(0,0,0,0\.7\)\), url\(\$\{province\.coverImage\}\)`, backgroundSize: 'cover', backgroundPosition: 'center' \} : \{\}\}>[\s\S]*?<\/div>\s*<\/div>/;

const newHero = `<div className={\`w-full h-[500px] relative flex items-center justify-center bg-\${province.color}-900 overflow-hidden\`}>
        {province.coverImage && (
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
            style={{ backgroundImage: \`url(\${province.coverImage})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50 dark:to-slate-900 z-0"></div>
        
        <Link href="/explore" className="absolute top-8 left-8 flex items-center text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full backdrop-blur-md transition-all z-20 group hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> <span className="font-bold tracking-wide">กลับหน้าสำรวจ</span>
        </Link>
        <div className="text-center text-white z-10 px-4 flex flex-col items-center mt-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={\`px-4 py-1.5 rounded-full bg-\${province.color}-500/20 backdrop-blur-md border border-\${province.color}-400/30 text-\${province.color}-200 text-sm font-bold tracking-widest uppercase mb-6\`}
          >
            Explore Province
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-black mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
          >
            {province.nameTh}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl opacity-90 drop-shadow-md font-light max-w-2xl text-slate-200"
          >
            {province.subtitle}
          </motion.p>
        </div>
      </div>`;

content = content.replace(heroRegex, newHero);

fs.writeFileSync(path, content);
console.log('Upgraded Province page');
