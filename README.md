# 日本の博物館、ギャラリー、その他展示施設のオープンデータ（Open Data for Museums, Galleries, and Exhibition Spaces in Japan）

日本国内の博物館、ギャラリー、その他の展示施設に関するオープンデータを公開するリポジトリです。

ファイル名等の識別子に用いる`MGES`はMuseums, Galleries, and Exhibition Spacesの略です。

## データの利用

`mges.csv` をそのまま取得して利用できます。

CSVはExcel、Googleスプレッドシート等のソフトで開くことが可能です。

## ライセンス

リポジトリ内の全てのファイル(データ、スキーマ、検証スクリプト、ドキュメント、設定ファイル等)を [CC0 1.0 Universal](./LICENSE) で公開しています。

## バージョン管理

バージョン管理はGitHubに委ねており、データファイル内にバージョン情報は持ちません。履歴はリポジトリのコミットログとリリースから参照できます。

## 詳細ドキュメント

収録基準、出典の扱い、ID採番方針、データモデルなどの詳細は別途ドキュメントサイトで公開予定です。以下のURLは暫定で、確定次第更新します。

- 収録基準: <https://mges.example.org/docs/criteria/inclusion/>
- 除外基準: <https://mges.example.org/docs/criteria/exclusion/>
- 出典について: <https://mges.example.org/docs/policy/sources/>
- ID採番ルール: <https://mges.example.org/docs/policy/ids/>
- データモデル: <https://mges.example.org/docs/reference/data-model/>
- 緯度経度の取得: <https://mges.example.org/docs/reference/data-model/>

## 開発

### ファイル

- `mges.csv`: データ本体(CSV、UTF-8 BOM付き、RFC 4180準拠)
- `mges.schema.json`: データを検証するためのJSONスキーマ(CSVをパース・型変換したオブジェクト配列に対する論理契約)
- `scripts/validate.ts`: 検証スクリプト(CSVパース + JSON Schema検証 + 後述のビジネスルール検証)
- `scripts/parse-csv.ts`: CSVパースユーティリティ
- `scripts/business-rules.ts`: クロスエントリのビジネスルール実装(ID重複検出、movedToId参照整合性)
- `scripts/geocode.ts`: 住所から暫定lat/lngを取得するジオコーディングスクリプト

### コマンド

```bash
pnpm install
pnpm check
```

`pnpm check`はtypecheck(`pnpm typecheck`)とschema検証(`pnpm validate`)と単体テスト(`pnpm test`)を順に実行します。
