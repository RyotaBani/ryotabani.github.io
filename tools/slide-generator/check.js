// 自己チェック: node check.js  — サンプルを2通り（答え＝ノート／次のページ）で作り、pptx の中身を確かめる
const { execFileSync } = require('child_process');
const assert = require('assert');
const { build } = require('./build');
const deck = require('./decks/sample');

const ls = f => execFileSync('unzip', ['-Z1', f]).toString().split('\n');
const cat = (f, p) => execFileSync('unzip', ['-p', f, p]).toString();

(async () => {
  const f1 = await build('decks/sample.js');
  const n = 1 + deck.slides.length + 1; // 表紙＋本文＋クイズ
  assert.strictEqual(ls(f1).filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p)).length, n, 'スライド枚数');
  assert(ls(f1).some(p => /^ppt\/media\/.+\.png$/.test(p)), 'QR画像が入っていない');
  const last = cat(f1, `ppt/slides/slide${n}.xml`);
  assert(last.includes('確認クイズ') && last.includes('joholab.net/network/'), 'クイズのページの文字');
  assert(cat(f1, `ppt/notesSlides/notesSlide${n}.xml`).includes('【答え】'), 'ノート欄に答えがない');

  deck.quiz.answers = 'nextSlide'; deck.file = 'check_nextSlide';
  const f2 = await build('decks/sample.js');
  assert(cat(f2, `ppt/slides/slide${n + 1}.xml`).includes('答え'), '答えのページがない');
  console.log('OK：', f1, '／', f2);
})().catch(e => { console.error('NG：', e.message); process.exit(1); });
