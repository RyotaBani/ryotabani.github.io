// 授業スライドの共通部品。体裁はここだけで決める（タイトル36pt・本文18pt・ＭＳ Ｐゴシック・紺見出し）
const QRCode = require('qrcode');

const STYLE = {
  font: 'ＭＳ Ｐゴシック',
  title: 36, body: 18,
  navy: '1F3864', accent: '2F5496', muted: '5B6472', line: 'C9D2E0', panel: 'F2F5FA',
  site: 'https://joholab.net/',
};
const KANA = ['ア', 'イ', 'ウ', 'エ', 'オ'];

function addTitle(slide, text) {
  slide.addText(text, { x: 0.5, y: 0.3, w: 12.3, h: 0.9, fontFace: STYLE.font, fontSize: STYLE.title, bold: true, color: STYLE.navy, margin: 0 });
  slide.addShape('line', { x: 0.5, y: 1.25, w: 12.3, h: 0, line: { color: STYLE.accent, width: 2 } });
}

// 表紙
function addCover(pptx, { title, sub }) {
  const s = pptx.addSlide();
  s.addText(title, { x: 0.8, y: 2.4, w: 11.7, h: 1.4, fontFace: STYLE.font, fontSize: 44, bold: true, color: STYLE.navy, align: 'center' });
  if (sub) s.addText(sub, { x: 0.8, y: 3.9, w: 11.7, h: 0.7, fontFace: STYLE.font, fontSize: 24, color: STYLE.muted, align: 'center' });
  return s;
}

// 見出し＋箇条書き。bullets の要素が配列なら1段下げる
function addBullets(pptx, { title, bullets, notes }) {
  const s = pptx.addSlide();
  addTitle(s, title);
  const rows = bullets.flatMap(b => Array.isArray(b)
    ? b.map(t => ({ text: t, options: { bullet: { indent: 18 }, indentLevel: 1, fontSize: STYLE.body - 2, breakLine: true } }))
    : [{ text: b, options: { bullet: true, breakLine: true } }]);
  s.addText(rows, { x: 0.6, y: 1.5, w: 12.1, h: 5.6, fontFace: STYLE.font, fontSize: STYLE.body, color: '222222', valign: 'top', paraSpaceAfter: 8 });
  if (notes) s.addNotes(notes);
  return s;
}

// 最後のページ：確認クイズ（2問程度）＋情報ラボのQR。答えはノート欄か、次のページに出す
async function addQuizQR(pptx, { title = '確認クイズ', qs, slug, label, answers = 'notes' }) {
  if (!qs || !qs.length) throw new Error('addQuizQR: qs が空です');
  for (const q of qs) if (!(q.ans >= 0 && q.ans < q.choices.length)) throw new Error(`addQuizQR: ans が選択肢の範囲外です（${q.q}）`);
  const url = STYLE.site + (slug ? slug.replace(/^\/|\/$/g, '') + '/' : '');
  const s = pptx.addSlide();
  addTitle(s, title);

  const rows = [];
  qs.forEach((q, i) => {
    rows.push({ text: `Q${i + 1}　${q.q}`, options: { bold: true, color: STYLE.navy, breakLine: true } });
    rows.push({ text: q.choices.map((c, j) => `${KANA[j]}　${c}`).join('　　'), options: { indentLevel: 1, breakLine: true, paraSpaceAfter: 14 } });
  });
  s.addText(rows, { x: 0.6, y: 1.5, w: 8.4, h: 5.2, fontFace: STYLE.font, fontSize: STYLE.body, color: '222222', valign: 'top' });

  // QR は正方形で置く。誤り訂正 M は教室のプロジェクター越しでも読める程度
  const data = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, width: 600 });
  s.addShape('rect', { x: 9.4, y: 1.5, w: 3.4, h: 5.2, fill: { color: STYLE.panel }, line: { color: STYLE.line } });
  s.addImage({ data, x: 9.75, y: 1.8, w: 2.7, h: 2.7 });
  s.addText([
    { text: 'もっと練習するなら', options: { fontSize: 14, color: STYLE.muted, breakLine: true } },
    { text: '情報ラボ' + (label ? `「${label}」` : ''), options: { fontSize: 16, bold: true, color: STYLE.navy, breakLine: true } },
    { text: url.replace(/^https:\/\//, ''), options: { fontSize: 12, color: STYLE.muted } },
  ], { x: 9.5, y: 4.65, w: 3.2, h: 1.9, fontFace: STYLE.font, align: 'center', valign: 'top' });

  const ansText = qs.map((q, i) => `Q${i + 1}　${KANA[q.ans]}　${q.choices[q.ans]}${q.why ? '\n　' + q.why : ''}`);
  if (answers === 'nextSlide') {
    addBullets(pptx, { title: title + '　答え', bullets: ansText });
  } else {
    s.addNotes('【答え】\n' + ansText.join('\n'));
  }
  return { slide: s, url };
}

function newDeck() {
  const PptxGenJS = require('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in（16:9）
  pptx.theme = { headFontFace: STYLE.font, bodyFontFace: STYLE.font };
  return pptx;
}

module.exports = { STYLE, newDeck, addCover, addBullets, addQuizQR };
