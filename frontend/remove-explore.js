const fs = require('fs');
const path = 'src/app/provinces/[slug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the specific Explore Province block
const oldBlock = `<motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={\`px-4 py-1.5 rounded-full bg-\${province.color}-500/20 backdrop-blur-md border border-\${province.color}-400/30 text-\${province.color}-200 text-sm font-bold tracking-widest uppercase mb-6\`}
          >
            Explore Province
          </motion.div>`;

content = content.replace(oldBlock, '');

fs.writeFileSync(path, content);
console.log('Removed Explore Province badge.');
