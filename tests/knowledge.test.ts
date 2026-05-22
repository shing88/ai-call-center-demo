import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const knowledgeRoot = join(process.cwd(), "knowledge");

function markdownFiles(relativeDirectory: string): string[] {
  return readdirSync(join(knowledgeRoot, relativeDirectory))
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function readKnowledgeFile(relativePath: string): string {
  return readFileSync(join(knowledgeRoot, relativePath), "utf8");
}

test("knowledge baseline contains the required fictional document sets", () => {
  assert.equal(markdownFiles("business_rules").length, 5);
  assert.equal(markdownFiles("customer_contracts").length, 8);
  assert.equal(markdownFiles("scenarios").length, 7);

  const readme = readKnowledgeFile("README.md");
  assert.match(readme, /架空/);
  assert.match(readme, /実在/);
});

test("customer contracts include required safety sections", () => {
  for (const fileName of markdownFiles("customer_contracts")) {
    const content = readKnowledgeFile(join("customer_contracts", fileName));

    assert.match(content, /^# 顧客契約:/m);
    assert.match(content, /架空顧客契約/);
    assert.match(content, /^## 契約状態/m);
    assert.match(content, /^## 本人確認項目/m);
    assert.match(content, /^## 特約/m);
    assert.match(content, /^## 注意事項/m);
    assert.doesNotMatch(content, /\d{2,4}-\d{2,4}-\d{4}/);
  }
});

test("CCNet public-fit business rule reflects service details, terms, and important explanations", () => {
  const content = readKnowledgeFile("business_rules/005_ccnet_public_service_guidance.md");

  assert.match(content, /10G 8,077円/);
  assert.match(content, /メッシュWi-Fi 990円/);
  assert.match(content, /36ヶ月/);
  assert.match(content, /初期契約解除制度/);
  assert.match(content, /ベストエフォート/);
  assert.match(content, /契約状態.*本人確認後/s);
});

test("CCNet fictional customer mockups keep realistic service state without real identifiers", () => {
  const content = readKnowledgeFile("customer_contracts/customer_ccnet_2001.md");

  assert.match(content, /customer_ccnet_2001/);
  assert.match(content, /CCNet光1G おとく割/);
  assert.match(content, /メッシュWi-Fi/);
  assert.match(content, /10G変更/);
  assert.match(content, /架空顧客契約/);
  assert.doesNotMatch(content, /\d{2,4}-\d{2,4}-\d{4}|丁目|番地/);
});

test("business rules separate pre-verification guidance from restricted details", () => {
  const identityRule = readKnowledgeFile("business_rules/001_identity_verification.md");

  assert.match(identityRule, /^## 本人確認前に案内してよいこと/m);
  assert.match(identityRule, /^## 本人確認前に案内してはいけないこと/m);
  assert.match(identityRule, /^## 確認できない場合/m);
});

test("demo scenarios reference evidence candidates and avoid final financial promises", () => {
  for (const fileName of markdownFiles("scenarios")) {
    const content = readKnowledgeFile(join("scenarios", fileName));

    assert.match(content, /架空シナリオ/);
    assert.match(content, /^## 根拠候補/m);
    assert.match(content, /^## 期待結果/m);
    assert.doesNotMatch(content, /返金額:|補償額:/);
  }
});
