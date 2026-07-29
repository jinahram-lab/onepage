# 탐구한장

학생 활동 키워드와 교사 관찰 내용을 바탕으로 과목별 세부능력 및 특기사항(세특) 초안을 만들고, 검토·수정·저장할 수 있는 교사용 웹앱입니다.

## 주요 기능

- 학생 식별값, 학년, 과목, 활동 키워드, 관찰 내용 입력
- 수집·작성·검토 3단계 AI 에이전트 흐름
- 과목별 세특 초안 확인 및 직접 수정
- 문구 복사 및 TXT 다운로드
- 저장 내역 조회 및 재확인
- Gemini 모델·API Key 개인 설정 화면
- Supabase용 테이블 및 Row Level Security SQL 제공

## 기술 스택

- Next.js / TypeScript
- Tailwind CSS
- Supabase PostgreSQL 및 Auth
- Google Gemini API
- Vercel 배포

## 실행

```bash
pnpm install
pnpm dev
```

빌드와 테스트:

```bash
pnpm run build
node --test tests/rendered-html.test.mjs
```

## 환경변수

`.env.example`을 참고해 Supabase와 Gemini 설정을 구성하세요.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

Supabase SQL은 [`db/supabase.sql`](db/supabase.sql)에 있습니다. 학생 식별값과 관찰 내용은 실제 서비스에서 개인정보 보호 기준에 맞게 관리해야 하며, AI 결과는 최종 기록 전 교사가 확인해야 합니다.
