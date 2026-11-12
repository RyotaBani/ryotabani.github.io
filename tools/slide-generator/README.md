# 授業スライドの生成（pptxgenjs）

サイトには載せない作業用ツール（`_config.yml` の `exclude` に `tools` を入れてある）。
`node_modules/` と `*.pptx` は `.gitignore` 済み。

## 準備（初回だけ）

```bash
cd ~/JohoLab/tools/slide-generator
npm install
```

## 作る

```bash
node build.js decks/sample.js        # → out/sample_ネットワーク.pptx
node build.js decks/a.js decks/b.js  # まとめて作る
node check.js                        # 自己チェック（枚数・QR画像・答えの位置）
```

## 授業のファイルを書く

`decks/sample.js` をコピーして中身を書きかえる。

- `slides`：見出し（`title`）と箇条書き（`bullets`）。配列を入れると1段下げる。`notes` はノート欄
- `quiz`：最後のページの確認クイズ
  - `qs`：`{ q: 問題, choices: [選択肢…], ans: 正解の番号（0から）, why: 解説（省略可） }`
  - `slug`：QR の飛び先（`network` → https://joholab.net/network/ ）
  - `answers`：`'notes'`＝答えをノート欄に（既定）／`'nextSlide'`＝次のページに答え

体裁（タイトル36pt・本文18pt・ＭＳ Ｐゴシック・紺の見出し）は `lib.js` の `STYLE` だけで決めている。
既存のスクリプトに組みこむときは `require('./lib').addQuizQR(pptx, {...})` を最後に呼ぶ（async）。
