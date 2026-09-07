#!/usr/bin/env python3
"""joholab のリリースzipを、正しい場所に安全に反映する。

使い方:
    python3 _tools/apply-zip.py joholab_v8.zip          # 確認のみ（既定）
    python3 _tools/apply-zip.py joholab_v8.zip --apply  # 実際に反映する

やること:
  1. zipを一時フォルダに展開する（リポジトリには直接展開しない）
  2. 各ファイルの canonical URL が、置き先のパスと一致するか検証する
     → binary/index.html をルートに置いてしまう事故を、ここで止める
  3. 現在のファイルとの差分を出す（NEW / 変更 / 同一）
  4. 現在あるのに新しい版から消えている目印を警告する（巻き戻しの検出）
  5. --apply のときだけコピーし、zipを _work/ に片づける
"""
import sys, os, re, shutil, tempfile, zipfile, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://joholab.net"

# 「この目印が現在あるのに新版に無ければ巻き戻しの疑い」として警告する
GUARDS = {
    "binary/index.html": ["convtable-split", "convtable-wide", "16進数は身近なところで"],
    "index.html": ['<a class="card" href="/bits/"'],
}


def canonical_of(text):
    m = re.search(r'rel="canonical"\s+href="([^"]+)"', text)
    return m.group(1) if m else None


def expected_canonical(rel):
    if rel == "index.html":
        return SITE + "/"
    if rel.endswith("/index.html"):
        return SITE + "/" + rel[: -len("index.html")]
    return None


def soon_is_last(text):
    """教材カードの並びで「準備中」が最後かどうか。"""
    cards = re.findall(r'<(?:a|div) class="card( soon)?"', text)
    if not cards:
        return True
    return bool(cards[-1].strip()) and not any(c.strip() for c in cards[:-1])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    apply_ = "--apply" in sys.argv
    if not args:
        print(__doc__)
        return 1
    zip_path = os.path.abspath(args[0])
    if not os.path.isfile(zip_path):
        print(f"zipが見つかりません: {zip_path}")
        return 1

    stage = tempfile.mkdtemp(prefix="joholab-zip-")
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = [n for n in z.namelist() if not n.endswith("/")]
            for n in names:  # zip slip 対策
                if n.startswith("/") or ".." in n.split("/"):
                    print(f"危険なパスが含まれています: {n}")
                    return 1
            z.extractall(stage)

        print(f"zip: {os.path.basename(zip_path)}  ({len(names)} ファイル)\n")

        # --- 検証 ---
        errors, warnings, plan = [], [], []
        for rel in sorted(names):
            if os.path.basename(rel) == ".DS_Store":
                continue
            src = os.path.join(stage, rel)
            dst = os.path.join(REPO, rel)
            new = open(src, encoding="utf-8", errors="replace").read()

            # canonical と置き先の一致（取り違えの検出）
            if rel.endswith(".html"):
                want = expected_canonical(rel)
                got = canonical_of(new)
                if want and got and got.rstrip("/") != want.rstrip("/"):
                    errors.append(
                        f"{rel}: canonical が {got} です。"
                        f"このファイルは {got.replace(SITE + '/', '') or '(ルート)'} 用で、"
                        f"{rel} には置けません"
                    )
                    continue

            if not os.path.exists(dst):
                plan.append((rel, "NEW", "新規"))
                continue
            cur = open(dst, encoding="utf-8", errors="replace").read()
            if cur == new:
                plan.append((rel, "SAME", "同一（変更なし）"))
                continue

            add = sum(1 for l in new.splitlines() if l not in cur.splitlines())
            rem = sum(1 for l in cur.splitlines() if l not in new.splitlines())
            plan.append((rel, "CHANGED", f"+{add} / -{rem} 行"))

            for marker in GUARDS.get(rel, []):
                if marker in cur and marker not in new:
                    warnings.append(f"{rel}: 現在ある「{marker}」が新版にありません（巻き戻しの疑い）")

            # 並べ替えは行数の増減に出ないので、構造として確かめる
            if rel == "index.html":
                if soon_is_last(cur) and not soon_is_last(new):
                    warnings.append(
                        f"{rel}: 「準備中」カードが末尾から動いています（巻き戻しの疑い）"
                    )

        # --- 表示 ---
        for rel, kind, note in plan:
            mark = {"NEW": "＋", "SAME": "・", "CHANGED": "→"}[kind]
            print(f"  {mark} {rel:<24} {note}")

        if warnings:
            print("\n⚠ 警告")
            for w in warnings:
                print("   - " + w)
        if errors:
            print("\n✖ 反映を中止しました")
            for e in errors:
                print("   - " + e)
            return 1

        changed = [p for p in plan if p[1] != "SAME"]
        if not changed:
            print("\n変更はありません。")
            return 0

        if not apply_:
            print(f"\n確認のみです。反映するには --apply を付けてください。")
            if warnings:
                print("（警告がある場合は、巻き戻して良いか確かめてから実行してください）")
            return 0

        # --- 反映 ---
        for rel, kind, _ in plan:
            if kind == "SAME":
                continue
            dst = os.path.join(REPO, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(stage, rel), dst)
            print(f"  反映: {rel}")

        work = os.path.join(REPO, "_work")
        os.makedirs(work, exist_ok=True)
        if os.path.dirname(zip_path) != work:
            shutil.move(zip_path, os.path.join(work, os.path.basename(zip_path)))
            print(f"  zipを _work/ に移動しました")

        print("\n完了しました。差分を確認してください:")
        print("  git status --short && git diff --stat")
        return 0
    finally:
        shutil.rmtree(stage, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
