const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'frontend', 'src', 'app');
const refs = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx)$/.test(entry.name)) continue;
    const text = fs.readFileSync(p, 'utf8');
    const re = /href\s*=\s*(?:"([^\"]+)"|'([^']+)')|router\.push\(\s*(?:'([^']+)'|"([^\"]+)")|api\.(?:get|post|put|delete)\(\s*(?:'([^']+)'|"([^\"]+)")/g;
    let m;
    while ((m = re.exec(text))) {
      for (let i = 1; i < m.length; i += 1) {
        if (m[i]) refs.add(m[i]);
      }
    }
  }
}

const existing = new Set();
function walkPages(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPages(p);
      continue;
    }
    if (/^page\./.test(entry.name)) {
      const rel = path.relative(root, path.dirname(p)).replace(/\\/g, '/');
      existing.add('/' + (rel === '.' ? '' : rel));
    }
  }
}

walk(root);
walkPages(root);

console.log('EXISTING_PAGES');
[...existing].sort().forEach((p) => console.log(p));
console.log('');
console.log('ROUTE_TARGETS');
[...refs].sort().forEach((r) => console.log(r));
console.log('');
console.log('MISSING_PAGE_TARGETS');
[...refs].sort().forEach((r) => {
  if (r.startsWith('api:')) return;
  if (!r.startsWith('/')) return;
  const p = r.replace(/\/$/, '') || '/';
  if (!existing.has(p) && !existing.has(p + '/index')) {
    console.log(r);
  }
});
