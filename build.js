#!/usr/bin/env node
// Bundles src/ into the single-file "PS Toolbox.html".
// Usage: node build.js
//
// src/shell.html holds the page markup with three kinds of placeholder line:
//   <!-- build:styles -->            every src/styles/*.css, in filename order
//   <!-- build:app <id> <file> -->   a sub-app HTML file, embedded as a JSON string the iframe loads
//   <!-- build:rooms -->             every src/rooms/*.js, in filename order (they share one closure)
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src'), OUT = path.join(__dirname, 'PS Toolbox.html');

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const concatDir = dir => fs.readdirSync(path.join(SRC, dir)).filter(f => !f.startsWith('.')).sort()
  .map(f => read(path.join(dir, f))).join('').replace(/\n$/, '');
// ASCII-only JSON with "</" escaped so the string can't close its <script> tag early
const embed = s => JSON.stringify(s)
  .replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
  .replace(/<\//g, '<\\/');

const out = read('shell.html').split('\n').map(line => {
  let m;
  if (line === '<!-- build:styles -->') return concatDir('styles');
  if (line === '<!-- build:rooms -->') return concatDir('rooms');
  if ((m = line.match(/^<!-- build:app (\S+) (\S+) -->$/)))
    return `<script type="application/json" id="${m[1]}">${embed(read(m[2]))}</script>`;
  return line;
}).join('\n');

fs.writeFileSync(OUT, out);
console.log(`Wrote ${path.basename(OUT)} (${Math.round(out.length / 1024)} KB)`);
