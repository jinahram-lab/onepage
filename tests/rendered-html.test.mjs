import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the 탐구한장 workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
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
