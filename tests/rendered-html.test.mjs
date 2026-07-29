import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function builtHtml() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("Next.js builds the 탐구한장 science workspace", async () => {
  const html = await builtHtml();
  assert.match(html, /<title>탐구한장 \| 과학 실험 결과지<\/title>/i);
  assert.match(html, /class="lab-shell/);
  assert.match(html, /access-card/);
  assert.match(html, /SCIENCE EXPERIMENT REPORT/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("keeps product metadata and Supabase schema aligned", async () => {
  const [layout, page, schema] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/supabase.sql", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title:\s*"탐구한장/);
  assert.match(page, /type Point/);
  assert.match(page, /function Graph/);
  assert.match(page, /실험 결과지/);
  assert.match(schema, /create table if not exists public\.student_records/);
  assert.match(schema, /create table if not exists public\.experiment_reports/);
  assert.match(schema, /report_data jsonb/);
  assert.match(schema, /create table if not exists public\.student_access/);
  assert.match(schema, /verify_student_access/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /auth\.uid\(\) = user_id/);
  assert.match(page, /saveReportToDb/);
  assert.match(page, /savedReports/);
  assert.match(page, /verifyStudentAccess/);
  assert.match(page, /student_access/);
  assert.match(page, /signInTeacher/);
  assert.match(page, /teacherReports/);
  assert.match(schema, /create table if not exists public\.teacher_profiles/);
  assert.match(schema, /Teachers can view all experiment reports/);
});
