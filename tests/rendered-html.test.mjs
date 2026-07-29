import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function builtHtml() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("Next.js builds the 탐구한장 workspace", async () => {
  const html = await builtHtml();
  assert.match(html, /<title>탐구한장 \| 과목별 세특 초안 작성<\/title>/i);
  assert.match(html, /세특 초안 만들기/);
  assert.match(html, /학생 활동과 관찰 내용/);
  assert.match(html, /저장 내역/);
  assert.match(html, /AI 3단계 검토/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("keeps product metadata and Supabase schema aligned", async () => {
  const [layout, page, schema] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/supabase.sql", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title:\s*"탐구한장 \| 과목별 세특 초안 작성"/);
  assert.match(page, /수집 에이전트/);
  assert.match(page, /작성 에이전트/);
  assert.match(page, /검토 에이전트/);
  assert.match(schema, /create table if not exists public\.student_records/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /auth\.uid\(\) = user_id/);
});
