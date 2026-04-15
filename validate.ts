/**
 * `mges.json`を`mges.schema.json`と照合し、追加のビジネスルール
 * (ID重複検出とmovedToId参照整合性)を検証するCLIスクリプト。
 * ビジネスルールの実装は`business-rules.ts`を参照。
 * 違反があればexit code 1、なければ0で終了する。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { checkBusinessRules, type Entry } from "./business-rules";

const dataPath = resolve(process.cwd(), "mges.json");
const schemaPath = resolve(process.cwd(), "mges.schema.json");

const data = JSON.parse(readFileSync(dataPath, "utf-8"));
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// 後続のビジネスルール検証は配列であることを前提とするため、
// schema検証の前にここで早期終了する。
if (!Array.isArray(data)) {
  console.error("[error] mges.jsonは配列(JSON array)である必要があります");
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

let exitCode = 0;

if (!validate(data)) {
  console.error("[error] Schema違反:");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  exitCode = 1;
}

const entries = data as Entry[];
const ruleErrors = checkBusinessRules(entries);
for (const err of ruleErrors) {
  console.error(`[error] ${err}`);
  exitCode = 1;
}

if (exitCode === 0) {
  console.log(`[info] OK: ${entries.length}件のエントリを検証しました`);
}

process.exit(exitCode);
