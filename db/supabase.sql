create table if not exists public.student_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_identifier text not null,
  grade text not null,
  term text,
  subject text not null,
  activity_keywords text,
  observation_notes text,
  activity_type text,
  teacher_notes text,
  collector_result jsonb,
  writer_result jsonb,
  reviewer_result jsonb,
  final_text text not null,
  review_status text not null default '검토 완료',
  model_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_records enable row level security;
create policy "Users can manage their own student records" on public.student_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 탐구한장의 핵심 DB 기능: 보고서 전체 상태를 JSONB로 저장·불러오기
create table if not exists public.experiment_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  student_name text not null,
  report_data jsonb not null
);

alter table public.experiment_reports enable row level security;

-- 로그인 없이 시연할 수 있는 MVP 정책입니다. 공개 서비스에서는 Supabase Auth와
-- user_id 컬럼을 추가해 사용자별 조회 정책으로 교체하세요.
drop policy if exists "Anyone can view demo experiment reports" on public.experiment_reports;
drop policy if exists "Anyone can save demo experiment reports" on public.experiment_reports;
drop policy if exists "Anyone can delete demo experiment reports" on public.experiment_reports;
create policy "Anyone can view demo experiment reports" on public.experiment_reports
  for select to anon, authenticated using (true);
create policy "Anyone can save demo experiment reports" on public.experiment_reports
  for insert to anon, authenticated with check (true);
create policy "Anyone can delete demo experiment reports" on public.experiment_reports
  for delete to anon, authenticated using (true);
