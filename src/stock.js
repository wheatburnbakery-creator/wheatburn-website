const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const FILE = path.join(config.DATA_DIR, 'stock.json');
function today() { return new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); }
function read() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (j.date === today() && j.counts) return j;
  } catch (e) {}
  return { date: today(), counts: {} };
}
function write(j) { fs.writeFileSync(FILE, JSON.stringify(j, null, 2)); }
function left(id) { const n = read().counts[id]; return typeof n === 'number' ? n : null; }
function set(id, n) { const j = read(); j.counts[id] = Math.max(0, Number(n)); write(j); }
function take(id, qty) {
  const j = read();
  if (typeof j.counts[id] === 'number') { j.counts[id] = Math.max(0, j.counts[id] - Number(qty)); write(j); }
}
module.exports = { left, set, take, read };
