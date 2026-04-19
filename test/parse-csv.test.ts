/**
 * `parse-csv.ts`の`parseCsvFile`が
 * CSVファイルを正しくオブジェクト配列に変換することを確認するテスト。
 */

import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvFile } from "../scripts/parse-csv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, "fixtures/csv");

describe("parseCsvFile", () => {
  it("最小カラムのCSVを配列に変換する", () => {
    const result = parseCsvFile(resolve(fixturesDir, "minimal.csv"));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "1",
      name: "テスト施設",
      postalCode: "102-0082",
      address: "東京都千代田区1-1",
      status: "営業",
      category: "博物館",
    });
  });

  it("空セルはオブジェクトから除外する", () => {
    const result = parseCsvFile(resolve(fixturesDir, "minimal.csv"));
    expect(result[0]).not.toHaveProperty("websiteUrl");
    expect(result[0]).not.toHaveProperty("lat");
    expect(result[0]).not.toHaveProperty("genres");
  });

  it("lat/lngを数値に変換する", () => {
    const result = parseCsvFile(resolve(fixturesDir, "full.csv"));
    expect(result[0]).toMatchObject({
      lat: 34.31,
      lng: 134.18,
    });
    expect(typeof result[0].lat).toBe("number");
    expect(typeof result[0].lng).toBe("number");
  });

  it("全フィールド埋まったCSVを変換する", () => {
    const result = parseCsvFile(resolve(fixturesDir, "full.csv"));
    expect(result[0]).toMatchObject({
      id: "1",
      name: "さぬき市公文書館",
      postalCode: "769-2396",
      status: "営業",
      category: "公文書館",
      genres: "公文書",
      relatedEntities: "さぬき市",
      sources: "公式サイト, さぬき市史",
    });
  });

  it("BOMを自動除去する(先頭列名にBOMが残らない)", () => {
    const result = parseCsvFile(resolve(fixturesDir, "minimal.csv"));
    expect(Object.keys(result[0])).toContain("id");
    const hasBomKey = Object.keys(result[0]).some((k) => k.charCodeAt(0) === 0xfeff);
    expect(hasBomKey).toBe(false);
  });

  it("ダブルクォートで囲まれたカンマ入りセルを正しくパースする", () => {
    const result = parseCsvFile(resolve(fixturesDir, "quoted.csv"));
    expect(result[0].name).toBe("カンマ, 含む名称");
  });

  it("エスケープされたダブルクォート(\"\")を含むセルを正しくパースする", () => {
    const result = parseCsvFile(resolve(fixturesDir, "edge-cases.csv"));
    expect(result[0].name).toBe('エスケープ"引用符"を含む名称');
  });

  it("改行を含むセルを正しくパースする", () => {
    const result = parseCsvFile(resolve(fixturesDir, "edge-cases.csv"));
    expect(result[1].name).toBe("改行を\n含む名称");
  });

  it("列数がヘッダと一致しない行があればエラーを投げる", () => {
    // relatedEntitiesに"A市, B団体"をクォートせず書いたケース。
    // 静かに切り捨てるとフィールドがズレたまま通るため明示的に検出する。
    expect(() => parseCsvFile(resolve(fixturesDir, "column-mismatch.csv"))).toThrow(
      /CSV行2の列数がヘッダと一致しません: expected 17, got 18/,
    );
  });
});
