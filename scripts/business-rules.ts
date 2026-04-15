/**
 * `mges.json`に対する追加検証(JSON Schemaでは表現しにくい
 * クロスエントリのビジネスルール)を実装する。
 */

/** `mges.json`の各エントリの最小型(ビジネスルール検証で参照する分のみ) */
export type Entry = {
  id: string;
  movedToId?: string;
};

/**
 * エントリ配列に対し、ID重複とmovedToId参照整合性を検証する。
 *
 * - ID重複: データセット内で同一IDが2回以上現れてはならない
 * - movedToId参照: movedToIdが指すIDがデータセット内に実在しなければならない
 *
 * @param entries 検証対象のエントリ配列
 * @returns 違反内容を表す日本語メッセージの配列。違反が無ければ空配列
 */
export function checkBusinessRules(entries: Entry[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  // movedToIdの参照先存在チェックは全IDを集めた後でないと行えないため、
  // ID収集と参照整合性チェックの2パスに分けている。
  for (const entry of entries) {
    if (ids.has(entry.id)) {
      errors.push(`重複ID: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  for (const entry of entries) {
    if (entry.movedToId && !ids.has(entry.movedToId)) {
      errors.push(`id=${entry.id}: movedToId="${entry.movedToId}"が存在しない`);
    }
  }

  return errors;
}
