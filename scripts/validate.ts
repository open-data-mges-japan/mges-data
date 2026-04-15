/**
 * `mges.csv`をパース・型変換した上で`mges.schema.json`と照合し、
 * さらにビジネスルール(ID重複検出とmovedToId参照整合性)を検証する
 * CLIスクリプト。ビジネスルールの実装は`business-rules.ts`を参照。
 * 違反があればexit code 1、なければ0で終了する。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";
import { parseCsvFile } from "./parse-csv";
import { checkBusinessRules, type Entry } from "./business-rules";

const dataPath = resolve(process.cwd(), "mges.csv");
const schemaPath = resolve(process.cwd(), "mges.schema.json");

const entries = parseCsvFile(dataPath);
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

let exitCode = 0;

if (!validate(entries)) {
  console.error("[error] Schema違反:");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  exitCode = 1;
}

const ruleErrors = checkBusinessRules(entries as Entry[]);
for (const err of ruleErrors) {
  console.error(`[error] ${err}`);
  exitCode = 1;
}

if (exitCode === 0) {
  console.log(`[info] OK: ${entries.length}件のエントリを検証しました`);
}

process.exit(exitCode);
