# 漢字書き順クイズ

漢字の各画が「どこで、どのように(とめ・はね・はらい)終わるか」だけを手がかりに、元の漢字を当てるクイズです。仕様は [specification/](specification/) にあります。

## 開発

Node.js 22 以上と pnpm を使います。

```sh
pnpm install
pnpm dev         # 開発サーバー
pnpm build       # 型チェックと本番用ビルド(dist/)
pnpm build:preview  # claude.ai のテスト用ページ向けビルド(dist-preview/)
pnpm test        # 単体テスト
pnpm lint        # ESLint と Prettier のチェック
pnpm typecheck   # 型チェック
```

### 出題データの生成

```sh
pnpm data:fetch  # KanjiVG と kanji-data を .cache/sources/ に取得
pnpm data:build  # public/data/ に出題データを生成
```

- 終わり方の自動推定を手で直すときは `data/overrides.json` に書きます。漢字と書き順の番号(1始まり)ごとに、`ending`(`tome` / `hane` / `harai`)と `direction`(`E` / `SE` / `S` / `SW` / `W` / `NW` / `N` / `NE`)を指定できます。

  ```json
  { "以": { "5": { "ending": "harai" } } }
  ```

- 自動推定に自信がない画は、生成時に `data/review-candidates.json` に書き出されます。確認して `data/overrides.json` に追加すると一覧から消えます。

## ライセンス

- ソースコード: [MIT License](LICENSE)
- 出題データ(`public/data/`): 下記の元データから作成しているため、[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) で配布します。

### 元データの出典

- [KanjiVG](https://kanjivg.tagaini.net/) © Ulrich Apel, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/): 書き順と各画の線
- [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) © Electronic Dictionary Research and Development Group, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/): 読みと常用漢字の一覧。JSON に変換した [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) 経由で取得しています。
