# 日本の博物館、ギャラリー、その他展示施設のオープンデータ（Open Data for Museums, Galleries, and Exhibition Spaces in Japan）

日本国内の博物館、ギャラリー、その他の展示施設のオープンデータを公開するリポジトリです。

ファイル名等の識別子に用いる`MGES`はMuseums, Galleries, and Exhibition Spacesの略です。

## データの利用

[mges.csv](./mges.csv)をそのまま利用できます。CSVファイルはExcel、Googleスプレッドシート等で開くことが可能です。

## ライセンス

リポジトリ内のファイルは、下記の例外を除き、[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.ja)で公開しています。

### ライセンスの例外

[mges.csv](./mges.csv)の`lat`/`lng`フィールドのうち、`latLngSource`が「推定値」のデータのライセンスは[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)です。
当該フィールドを利用する場合は、[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)のデータとして扱ってください。

- これらのデータは、住所文字列をもとに、[`normalize-japanese-addresses`](https://github.com/geolonia/normalize-japanese-addresses)(株式会社Geolonia)を使用して取得しています
- [`normalize-japanese-addresses`](https://github.com/geolonia/normalize-japanese-addresses)は[`japanese-addresses-v2`](https://github.com/geolonia/japanese-addresses-v2)(株式会社Geolonia)から住所データを取得しています
- [`japanese-addresses-v2`](https://github.com/geolonia/japanese-addresses-v2)は[アドレス・ベース・レジストリ](https://www.digital.go.jp/policies/base_registry_address)(デジタル庁)をもとに作成されています

## バージョン管理

バージョン管理はGitHub上で行われ、データファイル内にバージョン情報は持ちません。

## ドキュメント

収載基準、出典の扱い、ID採番方針、データモデルなどの詳細は、別途ドキュメントサイトで公開予定です。

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

`pnpm check`は以下を順に実行します。

- `pnpm typecheck`: typecheck
- `tsx scripts/geocode.ts --strict`: 空欄lat/lngの自動取得。取得失敗または空欄残存で exit 1
- `pnpm validate`: schema検証とビジネスルール検証
- `pnpm test`: 単体テスト
