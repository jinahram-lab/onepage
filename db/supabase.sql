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
