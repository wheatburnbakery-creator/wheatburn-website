const stock = require('../src/stock');
const config = require('../src/config');
const fs = require('node:fs'), path = require('node:path');
const products = JSON.parse(fs.readFileSync(path.join(config.DATA_DIR, 'products.json'), 'utf8')).products;
const [cmd, id, n] = process.argv.slice(2);
if (cmd === 'set') {
  if (!products.find(p => p.id === id)) { console.log('Unknown id:', id); process.exit(1); }
  stock.set(id, n); console.log('Set', id, '=', n);
} else {
  const c = stock.read().counts;
  products.forEach(p => console.log(p.id.padEnd(28), p.name || '', '-', id === undefined && c[p.id] !== undefined ? c[p.id] + ' left' : (c[p.id] !== undefined ? c[p.id] + ' left' : 'unlimited')));
}
