# Open Data for Museums, Galleries, and Exhibition Spaces in Japan

日本国内の博物館、ギャラリー、その他の展示施設のうち、展覧会形式で公開を行う施設に関するオープンデータを公開するリポジトリです。

ファイル名等の識別子に用いる`MGES`はMuseums, Galleries, and Exhibition Spacesの略です。

## ファイル

- `mges.csv`: データ本体(CSV、UTF-8 BOM付き、RFC 4180準拠)
- `mges.schema.json`: データを検証するJSON Schema(CSVをパース・型変換したオブジェクト配列に対する論理契約)
- `scripts/validate.ts`: 検証スクリプト(CSVパース + JSON Schema検証 + 後述のビジネスルール検証)
- `scripts/parse-csv.ts`: CSVパースユーティリティ
- `scripts/business-rules.ts`: クロスエントリのビジネスルール実装(ID重複検出、movedToId参照整合性)
- `scripts/geocode.ts`: 住所から暫定lat/lngを取得するジオコーディングスクリプト

## データの取得と利用

最新版は `mges.csv` をそのまま取得して利用できます。特定バージョンに固定したい場合はリポジトリのコミットハッシュやタグを指定してください。

CSVはExcel、Google Sheets、LibreOffice Calc等のスプレッドシートソフトで直接開けます。プログラムから利用する場合は、お好みの言語の標準的なCSVライブラリでパースしてください。JSON等の別形式が必要な場合は各自で変換してください。

バージョン管理はGitHubに委ねており、データファイル内にバージョン情報は持ちません。履歴はリポジトリのコミットログとリリースから参照できます。

### 緯度経度について

`lat`/`lng`は住所文字列から推定した暫定値を含みます。`latLngSource`列で値の出典を判別できます。

- `推定値`: `@geolonia/normalize-japanese-addresses`による住所推定。町丁目代表点や番地レベルの座標であり、施設の正確な位置ではない
- `現地取得`: 人手で現地取得・確認した値
- 空: 未設定

厳密な施設位置が必要な用途では、`latLngSource`が`現地取得`の行のみをフィルタするか、別途自前で確認してください。

### 編集時の注意

- ID、郵便番号、日付は**文字列**として扱います。Excelが数値・日付型に自動変換した場合は書式を「文字列」に戻してください
- 保存形式は**UTF-8 (BOM付き)**、区切り文字は**カンマ**、引用符は**ダブルクォート**(RFC 4180)
- セル内にカンマ・改行・ダブルクォートが含まれる場合は自動的にダブルクォートで囲んでください(多くのスプレッドシートソフトが自動処理します)

## ライセンス

リポジトリ内の全てのファイル(データ、スキーマ、検証スクリプト、ドキュメント、設定ファイル等)を [CC0 1.0 Universal](./LICENSE) で公開しています。著作権を放棄し、いかなる目的でも自由に利用できます。

## 詳細ドキュメント

収録基準、出典の扱い、ID採番方針、データモデルなどの詳細は別途ドキュメントサイトで公開予定です。以下のURLは暫定で、確定次第更新します。

- 収録基準: <https://mges.example.org/docs/criteria/inclusion/>
- 除外基準: <https://mges.example.org/docs/criteria/exclusion/>
- 出典について: <https://mges.example.org/docs/policy/sources/>
- ID採番ルール: <https://mges.example.org/docs/policy/ids/>
- データモデル: <https://mges.example.org/docs/reference/data-model/>

## 貢献方法

### 報告・提案

- 既存データの誤り: Issueテンプレート`data-correction`をご利用ください
- 新規エントリの提案: Issueテンプレート`new-entry`をご利用ください

### Pull Request

変更内容によっては事前にIssueで相談することを推奨します。PRには以下を含めてください。

- 変更内容の説明
- 出典(該当する場合)
- `pnpm check`での検証通過

## 開発

```bash
pnpm install
pnpm check
```

`pnpm check`はtypecheck(`pnpm typecheck`)とschema検証(`pnpm validate`)と単体テスト(`pnpm test`)を順に実行します。

Node.js v20以上、pnpm v9以上が必要です。

## 変更履歴

リポジトリのコミットログとリリースを参照してください。
