/**
 * `mges.csv`の各エントリに対し、住所から暫定的な緯度経度を取得して書き戻すスクリプト。
 * `@geolonia/normalize-japanese-addresses`を使い、町丁目(level>=3)まで
 * 特定できた場合のみ値を採用する。
 *
 * @example
 * pnpm tsx scripts/geocode.ts            # 実行して上書き
 * pnpm tsx scripts/geocode.ts --dry-run  # 差分のみ表示(書き込みなし)
 * pnpm tsx scripts/geocode.ts --strict   # 取得失敗や空欄残存でexit 1(pnpm checkで使用)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalize } from "@geolonia/normalize-japanese-addresses";

const MIN_LEVEL = 3;
const DELAY_MS = 200;

const LEVEL_LABEL: Record<number, string> = {
  0: "都道府県も特定できなかった",
  1: "都道府県までしか特定できなかった",
  2: "市区町村までしか特定できなかった",
};

const dryRun = process.argv.includes("--dry-run");
const strict = process.argv.includes("--strict");
const csvPath = resolve(process.cwd(), "mges.csv");

const raw = readFileSync(csvPath, "utf-8");
const hasBom = raw.charCodeAt(0) === 0xfeff;
const text = hasBom ? raw.slice(1) : raw;

function parseCsvText(t: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += c; i += 1; continue;
    }
    if (c === ",") { row.push(field); field = ""; i += 1; continue; }
    if (c === "\n" || c === "\r") {
      row.push(field); rows.push(row); row = []; field = "";
      i += 1; if (c === "\r" && t[i] === "\n") i += 1; continue;
    }
    if (c === '"' && field === "") { inQuotes = true; i += 1; continue; }
    field += c; i += 1;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function quoteField(f: string): string {
  if (f.includes(",") || f.includes('"') || f.includes("\n") || f.includes("\r")) {
    return '"' + f.replace(/"/g, '""') + '"';
  }
  return f;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

const rows = parseCsvText(text);
const [header, ...dataRows] = rows;

const idIdx = header.indexOf("id");
const addressIdx = header.indexOf("address");
const latIdx = header.indexOf("lat");
const lngIdx = header.indexOf("lng");
const sourceIdx = header.indexOf("latLngSource");

if ([idIdx, addressIdx, latIdx, lngIdx, sourceIdx].includes(-1)) {
  console.error("[error] 必要なカラムが見つかりません");
  process.exit(1);
}

let updated = 0;
let skipped = 0;
let errored = 0;

for (let i = 0; i < dataRows.length; i++) {
  const row = dataRows[i];
  const id = row[idIdx];
  const address = row[addressIdx];
  const hasLatLng = row[latIdx] !== "" && row[lngIdx] !== "";
  const hasSource = row[sourceIdx] !== "";

  if (hasLatLng || hasSource) {
    continue;
  }

  let result;
  try {
    result = await normalize(address);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[error] id=${id}: 住所正規化でエラー (${address}): ${msg}`);
    errored++;
    continue;
  }

  if (!result.point || result.level < MIN_LEVEL) {
    const reason = LEVEL_LABEL[result.level] ?? `level=${result.level}`;
    console.warn(`[warn] id=${id}: ${reason}ため採用しない (町丁目レベル(level>=${MIN_LEVEL})が必要): ${address}`);
    skipped++;
    continue;
  }

  const lat = result.point.lat.toFixed(6);
  const lng = result.point.lng.toFixed(6);

  if (dryRun) {
    console.log(`[dry-run] id=${id}: lat=${lat}, lng=${lng}, level=${result.level}`);
  } else {
    row[latIdx] = lat;
    row[lngIdx] = lng;
    row[sourceIdx] = "推定値";
  }
  updated++;

  if (i < dataRows.length - 1) {
    await sleep(DELAY_MS);
  }
}

if (!dryRun && updated > 0) {
  const allRows = [header, ...dataRows];
  const csvOut = allRows.map(r => r.map(quoteField).join(",")).join("\n") + "\n";
  writeFileSync(csvPath, (hasBom ? "\ufeff" : "") + csvOut, "utf-8");
}

const remaining = dataRows.filter(r => r[latIdx] === "" || r[lngIdx] === "").length;

console.log(`[info] 完了: ${updated}件更新, ${skipped}件スキップ, ${errored}件エラー${dryRun ? " (dry-run)" : ""}`);

if (strict) {
  if (errored > 0 || skipped > 0 || remaining > 0) {
    console.error(`[error] strictモード: 緯度経度を埋められなかったエントリがあります`);
    console.error(`[error] - 取得エラー: ${errored}件 (住所正規化で例外発生)`);
    console.error(`[error] - 採用見送り: ${skipped}件 (町丁目レベル(level>=${MIN_LEVEL})まで特定できなかった、上記[warn]参照)`);
    console.error(`[error] - 空欄残存: ${remaining}件 (lat/lngが空欄のまま)`);
    console.error(`[error] 対処: 該当エントリのlat/lng/latLngSourceを手動で埋めてください`);
    process.exit(1);
  }
}
