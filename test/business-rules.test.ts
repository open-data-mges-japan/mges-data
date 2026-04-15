/**
 * `business-rules.ts`の`checkBusinessRules`が
 * ID重複とmovedToId参照整合性を正しく検出することを確認するテスト。
 */

import { describe, it, expect } from "vitest";
import { checkBusinessRules, type Entry } from "../scripts/business-rules";

describe("checkBusinessRules", () => {
  it("正常データではエラーを返さない", () => {
    const entries: Entry[] = [
      { id: "1" },
      { id: "2", movedToId: "1" },
    ];
    expect(checkBusinessRules(entries)).toEqual([]);
  });

  it("空配列ではエラーを返さない", () => {
    expect(checkBusinessRules([])).toEqual([]);
  });

  it("ID重複を検出する", () => {
    const entries: Entry[] = [
      { id: "1" },
      { id: "1" },
    ];
    const errors = checkBusinessRules(entries);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("重複ID: 1");
  });

  it("movedToIdの参照先が存在しない場合エラーを返す", () => {
    const entries: Entry[] = [
      { id: "1", movedToId: "999" },
    ];
    const errors = checkBusinessRules(entries);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("999");
  });

  it("movedToIdが既存IDを参照している場合はエラーなし", () => {
    const entries: Entry[] = [
      { id: "1" },
      { id: "2", movedToId: "1" },
    ];
    expect(checkBusinessRules(entries)).toEqual([]);
  });

  it("ID重複と参照不整合が両方ある場合は両方検出する", () => {
    const entries: Entry[] = [
      { id: "1" },
      { id: "1" },
      { id: "2", movedToId: "999" },
    ];
    const errors = checkBusinessRules(entries);
    expect(errors).toHaveLength(2);
  });
});
