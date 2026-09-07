# 情報ラボ（joholab.net）

高校「情報Ⅰ」の内容を、手を動かして体験できる無料教材サイト。
GitHub Pages で公開。`main` に push すると自動デプロイされる（反映まで1〜2分）。

- 本番URL: https://joholab.net/
- リポジトリ: RyotaBani/ryotabani.github.io
- ドメイン: Cloudflare Registrar（DNSもCloudflare、プロキシはOFF＝DNSのみ）

## ディレクトリ構成

```
/
├── index.html          トップページ（教材一覧）
├── ads.txt             AdSense用（pub-IDは審査通過後に差し替え）
├── robots.txt
├── sitemap.xml         教材を追加したら必ずURLを追記する
├── CNAME               joholab.net（GitHubが自動生成。消さない）
├── image/index.html    画像のデジタル化（標本化・量子化・符号化＋どっと絵）
└── binary/index.html   2進数・16進数（しくみ／変換練習／ビットゲーム／2進⇔16進ゲーム）
```

## 新しい教材を追加する手順

1. `<slug>/index.html` を作る（例: `sound/index.html`）
2. `index.html`（トップ）の「準備中」カードを、実際のリンクカードに差し替える
3. `sitemap.xml` に `<url><loc>https://joholab.net/<slug>/</loc>...</url>` を追加
4. 全ページのフッター（`.sitefoot`）に新教材へのリンクを追加
5. commit して push

## 教材ページの決まりごと

### 全体
- **1ファイル完結**。外部CSS・JS・フォント・画像に依存しない（CDNも使わない）
- スマホ・タブレットで指で操作できること（`touch-action:none`、ポインタイベント）
- `localStorage` などのブラウザストレージは使わない
- 日本語。漢字は高校生が読める範囲。専門用語は初出時に説明する

### 必須の head 要素
```html
<title>（教材名）｜情報ラボ</title>
<meta name="description" content="（120字程度。何ができるツールか）">
<link rel="canonical" href="https://joholab.net/<slug>/">
<meta property="og:title" / "og:description" / "og:type" / "og:url">
```
`<head>` の末尾に AdSense ローダーを入れる（下記「広告」参照）。

### ページ構成（この順番）
1. `header`（`.sitenav` パンくず → `h1` → `.lead`）
2. タブ（複数モードがある場合）
3. ツール本体
4. `section.article` — **解説記事を必ず入れる。2000字以上**
   検索流入とAdSense審査の両方に効くので省略しない
5. `.ad-slot` 広告枠
6. `.sitefoot` フッター

### デザイントークン
```css
--navy:#2F5496;  /* 見出し・主要UI */
--ink:#1F3864;   /* 濃い文字・暗背景 */
--paper:#ffffff;
--panel:#F2F5FA; --panel2:#E7ECF5;  /* カード地 */
--muted:#5B6472; --line:#C9D2E0;
--ok:#2E7D4F;    /* 正解・安全 */
--ng:#C00000;    /* 誤り・危険 */
--gold:#C49A2B;  /* アクセント */
```
- フォント: `"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",sans-serif`
- 数値・符号は等幅: `ui-monospace,Consolas,monospace`
- `.wrap{max-width:1060px}`、記事本文に `max-width` を掛けない（横いっぱいに広げる）
- 暗い背景のパネル: `linear-gradient(180deg,#22345a,#1b2c4d)`
- `@media (prefers-reduced-motion:reduce)` でアニメーションを止める

## 広告

`<head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```
本文末（フッターの前）:
```html
<div class="ad-slot" aria-label="広告">
  <span class="ad-label">広告 / PR</span>
  <div class="ad-placeholder">広告枠（AdSenseの審査通過後にここへ表示されます）</div>
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</div>
```
- **「広告 / PR」の表記は必ず残す**（景表法のステマ規制対応）
- AdSense審査通過後、`ca-pub-…` と `data-ad-slot` を全ページ＋`ads.txt` で差し替える

## 内容の正確さ

- 数値・規格・法令は一次情報で裏を取る（文化庁、総務省、IPA、RFC、各社公式）
- 出典を書く場合は `出典：〜` として本文末か図の直下に置く
- **他サイトの教材を複製しない**。学習の狙いが同じでも、設計・実装は独自にする

## 作業のとき

- 変更したら必ずブラウザで開いて動作確認する（コンソールエラーがないこと）
- push 前に、追加・変更したページのリンクが全て繋がっているか確認する
- commit メッセージは日本語で簡潔に（例: `音のデジタル化の教材を追加`）

## 今後の予定

- [ ] 音のデジタル化（標本化周波数・量子化ビット数・波形・データ量）
- [ ] 文字コード（ASCII / Unicode、文字と番号の対応）
- [ ] ネットワーク（IPアドレス、サブネット）
- [ ] AdSense申込・審査通過後のID差し替え
- [ ] Google Search Console にサイトマップを登録
