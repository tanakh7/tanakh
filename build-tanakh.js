/**
 * build-tanakh.js
 * Downloads all 39 Tanakh books (Hebrew with Nikkud) from the Sefaria open-source
 * GitHub export and writes a single compact tanakh.json for offline use.
 *
 * Usage:  node build-tanakh.js
 * Output: tanakh.json  (~4-5 MB, ~1.5 MB gzipped)
 *
 * Data source: https://github.com/Sefaria/Sefaria-Export (Public Domain)
 */

'use strict';
const https = require('https');
const http  = require('http');
const fs    = require('fs');

// ── Book list: [English name, GitHub section folder] ──────────────────────
const BOOKS = [
  // Torah
  ['Genesis',       'Torah'],
  ['Exodus',        'Torah'],
  ['Leviticus',     'Torah'],
  ['Numbers',       'Torah'],
  ['Deuteronomy',   'Torah'],
  // Neviim
  ['Joshua',        'Prophets'],
  ['Judges',        'Prophets'],
  ['I Samuel',      'Prophets'],
  ['II Samuel',     'Prophets'],
  ['I Kings',       'Prophets'],
  ['II Kings',      'Prophets'],
  ['Isaiah',        'Prophets'],
  ['Jeremiah',      'Prophets'],
  ['Ezekiel',       'Prophets'],
  ['Hosea',         'Prophets'],
  ['Joel',          'Prophets'],
  ['Amos',          'Prophets'],
  ['Obadiah',       'Prophets'],
  ['Jonah',         'Prophets'],
  ['Micah',         'Prophets'],
  ['Nahum',         'Prophets'],
  ['Habakkuk',      'Prophets'],
  ['Zephaniah',     'Prophets'],
  ['Haggai',        'Prophets'],
  ['Zechariah',     'Prophets'],
  ['Malachi',       'Prophets'],
  // Ketuvim
  ['Psalms',        'Writings'],
  ['Proverbs',      'Writings'],
  ['Job',           'Writings'],
  ['Song of Songs', 'Writings'],
  ['Ruth',          'Writings'],
  ['Lamentations',  'Writings'],
  ['Ecclesiastes',  'Writings'],
  ['Esther',        'Writings'],
  ['Daniel',        'Writings'],
  ['Ezra',          'Writings'],
  ['Nehemiah',      'Writings'],
  ['I Chronicles',  'Writings'],
  ['II Chronicles', 'Writings'],
];

const BASE = 'https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/json/Tanakh';
const FILE = 'Tanach%20with%20Nikkud.json';

function bookUrl(name, section) {
  return `${BASE}/${section}/${encodeURIComponent(name)}/Hebrew/${FILE}`;
}

// ── HTTP fetch with redirect support ──────────────────────────────────────
function get(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects < 0) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, redirects - 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripHtml(s) {
  return String(s ?? '').replace(/<[^>]*>/g, '').trim();
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const tanakh  = {};
  const failed  = [];
  let   total   = 0;

  console.log('Downloading Tanakh from Sefaria-Export (GitHub)...\n');

  for (const [name, section] of BOOKS) {
    const url = bookUrl(name, section);
    process.stdout.write(`  ${name.padEnd(20)}`);

    try {
      const raw  = await get(url);
      const data = JSON.parse(raw);

      // data.text is a 2-D array: [chapterIndex][verseIndex]
      const chapters = data.text;
      if (!Array.isArray(chapters)) throw new Error('unexpected structure');

      tanakh[name] = chapters.map(ch =>
        Array.isArray(ch) ? ch.map(v => stripHtml(v)) : []
      );

      const verses = tanakh[name].reduce((s, ch) => s + ch.length, 0);
      total += verses;
      console.log(`✓  ${chapters.length} chapters, ${verses} verses`);

    } catch (err) {
      console.log(`✗  ${err.message}`);
      failed.push(name);
    }

    await sleep(250); // gentle rate-limit for GitHub servers
  }

  console.log('');

  if (failed.length) {
    console.error('Failed books:', failed.join(', '));
    process.exit(1);
  }

  const json   = JSON.stringify(tanakh);
  const sizeMB = (Buffer.byteLength(json, 'utf8') / 1024 / 1024).toFixed(2);
  fs.writeFileSync('tanakh.json', json, 'utf8');

  console.log(`Done!  tanakh.json  (${sizeMB} MB, ${total.toLocaleString()} verses)`);
}

main().catch(err => { console.error(err); process.exit(1); });
