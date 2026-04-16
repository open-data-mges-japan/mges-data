/**
 * `mges.schema.json`の検証ルール(必須項目、enum、pattern、依存関係、
 * if/then/else等)が期待通りに動作するかを`test/fixtures/`配下のJSONで
 * 確認するテスト。
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "mges.schema.json");
const fixturesDir = resolve(__dirname, "fixtures");

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

/**
 * Ajvインスタンスを初期化し、`mges.schema.json`をコンパイルしたバリデーション関数を返す。
 *
 * @returns Ajvの`ValidateFunction`。渡したデータがschemaに適合するかを真偽値で返す
 */
function createValidator() {
  const ajv = new Ajv({ allErrors: true });
  return ajv.compile(schema);
}

/**
 * `test/fixtures/`配下のJSON fixtureを読み込んでパースする。
 *
 * @param name fixtureファイル名(例: `valid-minimal.json`)
 * @returns パース結果(配列やオブジェクト等のJSON値)
 */
function loadFixture(name: string) {
  return JSON.parse(readFileSync(resolve(fixturesDir, name), "utf-8"));
}

describe("mges.schema.json", () => {
  const validate = createValidator();

  it("有効な最小エントリを受け入れる", () => {
    const data = loadFixture("valid-minimal.json");
    expect(validate(data)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("全フィールド埋まった有効データを受け入れる", () => {
    const data = loadFixture("valid-full.json");
    expect(validate(data)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("name欠如のエントリを拒否する", () => {
    const data = loadFixture("invalid-missing-name.json");
    expect(validate(data)).toBe(false);
  });

  it("郵便番号フォーマット不正のエントリを拒否する", () => {
    const data = loadFixture("invalid-bad-postal.json");
    expect(validate(data)).toBe(false);
  });

  it("住所が都道府県名で始まらないエントリを拒否する", () => {
    const data = loadFixture("invalid-bad-address.json");
    expect(validate(data)).toBe(false);
  });

  it("latのみでlngが無いエントリを拒否する", () => {
    const data = loadFixture("invalid-lat-without-lng.json");
    expect(validate(data)).toBe(false);
  });

  it("status=移転でmovedToIdが無いエントリを受け入れる", () => {
    const data = loadFixture("invalid-moved-without-movedtoid.json");
    expect(validate(data)).toBe(true);
  });

  it("status!=移転なのにmovedToIdを持つエントリを拒否する", () => {
    const data = loadFixture("invalid-movedtoid-without-moved.json");
    expect(validate(data)).toBe(false);
  });

  it("latLngSourceのみでlat/lngが無いエントリを拒否する", () => {
    const data = loadFixture("invalid-latlngsource-without-latlng.json");
    expect(validate(data)).toBe(false);
  });
});
