# Open Data for Museums, Galleries, and Exhibition Spaces in Japan

日本国内の博物館、ギャラリー、その他の展示施設のうち、展覧会形式で公開を行う施設に関するオープンデータを公開するリポジトリです。

ファイル名等の識別子に用いる`MGES`はMuseums, Galleries, and Exhibition Spacesの略です。

## ファイル

- `mges.json`: データ本体(JSON配列)
- `mges.schema.json`: データを検証するJSON Schema
- `validate.ts`: 検証スクリプト(JSON Schema検証 + 後述のビジネスルール検証)
- `business-rules.ts`: クロスエントリのビジネスルール実装(ID重複検出、movedToId参照整合性)

## データの取得と利用

最新版は `mges.json` をそのまま取得して利用できます。特定バージョンに固定したい場合はリポジトリのコミットハッシュやタグを指定してください。

バージョン管理はGitHubに委ねており、データファイル内にバージョン情報は持ちません。履歴はリポジトリのコミットログとリリースから参照できます。

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
- `npm run check`での検証通過

## 開発

```bash
npm install
npm run check
```

`npm run check`はschema検証(`npm run validate`)と単体テスト(`npm test`)を順に実行します。

Node.js v20以上が必要です。

## 変更履歴

リポジトリのコミットログとリリースを参照してください。
