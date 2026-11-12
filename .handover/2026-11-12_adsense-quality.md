# 引き継ぎ：AdSense「有用性の低いコンテンツ」への対応（2026-11-12）

## 状況
- AdSense で joholab.net が「要確認：有用性の低いコンテンツ」（AdSense 最終更新 2026/10/24）。広告は出ていない
- 改善はブランチ `feature/adsense-quality` にコミット済み（5コミット）。**main へのマージと push はまだ**
  - Claude からの push は auto mode の判定（本番デプロイ）で止められたため、Ryota が手で行う
- 再審査のリクエストは未実施（Ryota が押す）

## 公開の手順（Ryota）
```bash
cd ~/JohoLab
git checkout main && git pull --ff-only origin main
git merge --no-edit feature/adsense-quality
git push origin main          # 1〜2分で反映
```
反映後に https://joholab.net/contact/ と https://joholab.net/curriculum/ が開けるか確認する。

## やったこと
- 25教材の記事末に「授業で使うときのポイント」を追加（`<!-- teach:start -->`〜`<!-- teach:end -->`）
  - ねらい／進め方の例（50分）／つまずきやすい点／振り返りの問い
  - image ml charcode stats regression bitop cluster vector compress
  - binary dataviz network algorithm crypto sysflow password jpeg phishing mail
  - logic datasize numerr simulation bits parity
  - 差し込みは scratchpad の insert.py（目印があるページは飛ばす）。ツールの操作名は各ページの「使い方」と照合済み
- curriculum：解説記事が無かったので新規作成（学習指導要領の4内容、情報Ⅱ、共通テスト、授業計画）。出典つき
- contact：お問い合わせページを新規作成
- about：「情報ラボについて・運営者情報」に改題。対象読者・教材の構成・広告についてを追加
- privacy：お問い合わせへのリンク、最終改定日 2026-11-12
- 全ページのフッター：「情報ラボについて・運営者情報」「お問い合わせ」
- トップ「このサイトについて」に対象読者を追記、sitemap に /contact/、更新履歴に 11/12 分を追記
- CLAUDE.md：about・contact・privacy・qr-attend、teach の目印、広告枠は審査通過まで置かない旨

## 点検結果（記事＝section.article の字数、空白除く）
| ページ | 前 | 後 |
|---|---|---|
| image | 1721 | 2687 |
| curriculum | 0（本文全体663） | 2114（本文全体2785） |
| ml | 2026 | 3000 |
| charcode | 2124 | 3083 |
| stats | 2191 | 3083 |
| regression | 2229 | 3038 |
| bitop | 2278 | 3068 |
| cluster | 2296 | 3139 |
| vector | 2307 | 3146 |
| compress | 2358 | 3225 |
| binary | 2373 | 3257 |
| dataviz | 2374 | 3247 |
| network | 2374 | 3267 |
| algorithm | 2404 | 3218 |
| crypto | 2504 | 3297 |
| sysflow | 2530 | 3320 |
| password | 2545 | 3379 |
| jpeg | 2547 | 3345 |
| phishing | 2572 | 3329 |
| mail | 2621 | 3428 |
| logic | 2672 | 3504 |
| bits | 2814 | 3620 |
| numerr | 2786 | 3616 |
| simulation | 2777 | 3601 |
| datasize | 2873 | 3713 |
| parity | 3184 | 4025 |
| about（本文全体） | 1467 | 2236 |
| contact（新規、本文全体） | − | 1146 |

- 変更なし（すでに十分）：color copyright design hash html personal problem program rfid sensor sheet sound sql textmining web computer cross dncl-quiz lessons
- title／description：全ページにあり、重複なし
- 「準備中」「近日公開」のページ：なし
- noindex：qr-attend（校内用。もともと noindex・フッターなし・sitemap なし）。今回 noindex にしたページはない
- 内部リンク切れ：なし（検出された4件は JS のテンプレート文字列と、web の通信例の中の `/style.css`）
- 転載：長い引用は ISO 9241-11 の定義（出典あり）と出典リストの資料名のみ
- ローカル確認：全51ページを幅390pxで読み込み、JSエラー0・横はみ出し0（_work/check390.html。_work は gitignore）

## 残った課題
- Google Search Console にサイトマップ未登録（CLAUDE.md の今後の予定）。再審査の前に登録し、主要ページがインデックスされているか確認したい
- lessons（2044字）、dncl-quiz（2485字）、cross（2292字）は2000字以上だが少なめ
- personal の「2026年に成立した改正」など、既存ページの事実確認は今回していない
- 広告枠（.ad-slot）は未設置。審査通過後、広告ユニットの data-ad-slot 番号を取ってから入れる
