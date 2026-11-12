// 使い方: node build.js decks/sample.js   → out/<file>.pptx を作る
const path = require('path');
const fs = require('fs');
const { newDeck, addCover, addBullets, addQuizQR } = require('./lib');

async function build(deckPath) {
  const deck = require(path.resolve(deckPath));
  const pptx = newDeck();
  pptx.title = deck.title;
  if (deck.cover !== false) addCover(pptx, { title: deck.title, sub: deck.sub });
  for (const sl of deck.slides || []) addBullets(pptx, sl);
  if (deck.quiz) await addQuizQR(pptx, deck.quiz);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const out = path.join(__dirname, 'out', (deck.file || path.basename(deckPath, '.js')) + '.pptx');
  await pptx.writeFile({ fileName: out });
  return out;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) { console.error('使い方: node build.js decks/<名前>.js [...]'); process.exit(1); }
  (async () => { for (const a of args) console.log('書き出し:', await build(a)); })()
    .catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { build };
