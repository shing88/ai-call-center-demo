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
    const contentWithoutAllowedDemoPhone = content.replaceAll("0000-00-0000", "");
    assert.doesNotMatch(contentWithoutAllowedDemoPhone, /\d{2,4}-\d{2,4}-\d{4}/);
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
  assert.match(content, /契約者の氏名、登録住所、登録電話番号/);
  assert.match(content, /契約者本人以外からの電話申し込みは受け付けず/);
});

test("CCNet fictional customer mockups keep realistic service state without real identifiers", () => {
  const content = readKnowledgeFile("customer_contracts/customer_ccnet_2001.md");

  assert.match(content, /customer_ccnet_2001/);
  assert.match(content, /CCNet光1G おとく割/);
  assert.match(content, /メッシュWi-Fi/);
  assert.match(content, /10G変更/);
  assert.match(content, /架空顧客契約/);
  assert.match(content, /デモ登録住所/);
  assert.match(content, /デモ登録電話番号: 0000-00-0000/);
  assert.match(content, /山本 花（やまもと はな）/);
  assert.match(content, /春日井市デモ町4丁目5番6号/);
  assert.doesNotMatch(content.replaceAll("0000-00-0000", ""), /\d{2,4}-\d{2,4}-\d{4}/);
});

test("CCNet demo customer profiles include identity answers for every visible scenario", () => {
  const expectedProfiles = [
    ["customer_ccnet_2001.md", /山本 花（やまもと はな）/, /春日井市デモ町4丁目5番6号/],
    ["customer_ccnet_2002.md", /田中 美咲（たなか みさき）/, /小牧市デモ町2丁目3番4号/],
    [
      "customer_ccnet_2003.md",
      /佐藤 亮（さとう りょう）/,
      /各務原市デモ町3丁目4番5号 デモハイツ101号室/
    ],
    ["customer_ccnet_2004.md", /森 彩乃（もり あやの）/, /豊川市デモ町1丁目2番3号/],
    ["customer_ccnet_2005.md", /西村 陽太（にしむら ようた）/, /小牧市デモ町5丁目6番7号/]
  ] as const;

  for (const [fileName, namePattern, addressPattern] of expectedProfiles) {
    const content = readKnowledgeFile(join("customer_contracts", fileName));

    assert.match(content, namePattern);
    assert.match(content, addressPattern);
    assert.match(content, /0000-00-0000/);
    assert.match(content, /電話口の相手/);
  }
});

test("CCNet Cable Plus existing-customer scenario requires contractor identity and caller verification", () => {
  const customer = readKnowledgeFile("customer_contracts/customer_ccnet_2004.md");
  const scenario = readKnowledgeFile("scenarios/scenario_06_ccnet_cableplus_existing_net_add.md");

  assert.match(customer, /契約者の氏名/);
  assert.match(customer, /森 彩乃（もり あやの）/);
  assert.match(customer, /登録住所/);
  assert.match(customer, /豊川市デモ町1丁目2番3号/);
  assert.match(customer, /とよかわし でもまち いっちょうめ にばん さんごう/);
  assert.match(customer, /登録電話番号/);
  assert.match(customer, /0000-00-0000/);
  assert.match(customer, /契約者本人以外からの電話申し込みはできない/);
  assert.match(scenario, /電話口の相手が契約者本人/);
  assert.match(scenario, /豊川市デモ町1丁目2番3号/);
  assert.match(scenario, /もり あやの/);
  assert.match(scenario, /とよかわし でもまち いっちょうめ にばん さんごう/);
  assert.match(scenario, /0000-00-0000/);
  assert.match(scenario, /契約者本人以外からの電話申し込みは受け付けず/);
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
