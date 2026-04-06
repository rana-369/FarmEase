const fs = require('fs');
const path = require('path');

const dirs = ['src/pages', 'src/components'];

dirs.forEach(d => {
  const walk = (p) => {
    fs.readdirSync(p).forEach(f => {
      const fp = path.join(p, f);
      if (fs.statSync(fp).isDirectory()) {
        walk(fp);
      } else if (f.endsWith('.jsx')) {
        let c = fs.readFileSync(fp, 'utf8');
        c = c.replace(/color:\s*'rgba\(255,255,255,0\.4\)'/g, "color: 'rgba(255,255,255,0.7)'");
        c = c.replace(/color:\s*'rgba\(255,255,255,0\.3\)'/g, "color: 'rgba(255,255,255,0.65)'");
        c = c.replace(/color:\s*'rgba\(255,255,255,0\.2\)'/g, "color: 'rgba(255,255,255,0.55)'");
        c = c.replace(/color:\s*'rgba\(255,255,255,0\.1\)'/g, "color: 'rgba(255,255,255,0.45)'");
        fs.writeFileSync(fp, c);
      }
    });
  };
  walk(d);
});

console.log('Color fixes applied!');
