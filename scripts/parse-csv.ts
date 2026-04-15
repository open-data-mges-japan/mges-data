/**
 * `mges.csv`をパースしてオブジェクト配列に変換するユーティリティ。
 * 変換後のオブジェクトは`mges.schema.json`に定義された論理スキーマに
 * 適合することを想定する(検証は`validate.ts`が行う)。
 */

import { readFileSync } from "node:fs";

const NUMERIC_FIELDS: ReadonlySet<string> = new Set(["lat", "lng"]);

/**
 * RFC 4180に準拠した最小限のCSVパーサ。
 *
 * - 先頭のUTF-8 BOM(U+FEFF)を除去する
 * - ダブルクォートで囲まれたセル内のカンマ・改行を1つのセルとして扱う
 * - 囲みセル内の連続ダブルクォート(`""`)は単一ダブルクォートへエスケープ解除
 * - CRLF / LFのどちらの改行でも行区切りとして認識
 * - 完全に空の行(カンマなし・空欄のみ)はスキップ
 *
 * 外部ライブラリに依存させないため自前実装している。
 *
 * @param text CSV全体の文字列
 * @returns 行ごとの配列。各行はセルの文字列配列
 */
function parseCsvText(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      if (c === "\r" && text[i] === "\n") i += 1;
      continue;
    }
    if (c === '"' && field === "") {
      inQuotes = true;
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  // 末尾が改行で終わっていない場合の残りセル・残り行を拾う
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // 空行(カンマなし・単一の空セル)を捨てる
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/**
 * CSVの1行分のレコードを、型変換と空セル除外を施したオブジェクトに変換する。
 *
 * 空セル(`""`)は「値なし」として扱い、返り値のオブジェクトからキーごと除外する。
 * schemaの任意項目は「キーが存在すれば検証する、存在しなければスキップする」仕様
 * のため、空文字を入れたまま渡すとminLength等で誤検出される。
 *
 * @param row CSV1行分のキー値ペア(全て文字列)
 * @returns 型変換・空セル除外後のオブジェクト
 */
function convertRow(row: Record<string, string>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === "") continue;
    if (NUMERIC_FIELDS.has(key)) {
      obj[key] = Number(value);
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

/**
 * CSVファイルを読み込み、ヘッダ行をキーとしたオブジェクト配列を返す。
 *
 * - UTF-8 BOMを自動的に除去する(Excel保存時のCSVに付くため)
 * - 空行はスキップする
 * - `lat`と`lng`は数値へ変換、その他は文字列のまま
 * - 空セルはオブジェクトから除外する
 *
 * @param path CSVファイルのパス
 * @returns パース・変換後のオブジェクト配列
 */
export function parseCsvFile(path: string): Record<string, unknown>[] {
  const content = readFileSync(path, "utf-8");
  const rows = parseCsvText(content);
  if (rows.length === 0) return [];
  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = row[i] ?? "";
    }
    return convertRow(obj);
  });
}
