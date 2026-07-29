"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Result = {
  id: string;
  studentIdentifier: string;
  grade: string;
  term: string;
  subject: string;
  finalText: string;
  source: string;
  createdAt: string;
  status: "검토 완료" | "확인 필요";
};

const subjects = ["과학", "국어", "수학", "영어", "사회", "정보", "미술", "체육"];
const sample = "온도 변화 실험에서 측정값을 표로 정리하고 그래프의 축과 단위를 확인함. 예상과 다른 결과가 나온 원인을 측정 시점과 측정 도구의 오차 가능성으로 설명함.";

function buildDraft(subject: string, activity: string, observation: string, grade: string) {
  const body = observation.trim() || activity.trim() || "학생 활동 내용을 입력해 주세요.";
  return `${subject} 수업에서 ${body} 이를 바탕으로 자료를 정리하고 결과를 해석하는 과정에서 자신의 생각을 구체적으로 표현함. 활동 과정에서 확인한 근거를 중심으로 탐구 내용을 정리하려는 태도가 나타남.`;
}

export default function Home() {
  const [view, setView] = useState<"write" | "history" | "settings">("write");
  const [grade, setGrade] = useState("중학교 2학년");
  const [term, setTerm] = useState("2026학년도 1학기");
  const [subject, setSubject] = useState("과학");
  const [student, setStudent] = useState("STU-001");
  const [activity, setActivity] = useState("온도 변화 측정, 실험 결과 표 작성, 그래프 작성, 오차 원인 분석");
  const [observation, setObservation] = useState(sample);
  const [activityType, setActivityType] = useState("탐구·실험");
  const [teacherNote, setTeacherNote] = useState("");
  const [model, setModel] = useState("Gemini 3.5 Flash-Lite");
  const [apiKey, setApiKey] = useState("");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("tamgu-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const ready = useMemo(() => student.trim() && (activity.trim() || observation.trim()), [student, activity, observation]);

  const generate = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready) { setNotice("학생 식별값과 활동 내용 또는 관찰 내용을 입력해 주세요."); return; }
    setNotice(""); setStage(1); setResult(null);
    window.setTimeout(() => setStage(2), 450);
    window.setTimeout(() => setStage(3), 900);
    window.setTimeout(() => {
      const draft = buildDraft(subject, activity, observation, grade);
      setResult({ id: crypto.randomUUID(), studentIdentifier: student, grade, term, subject, finalText: draft, source: `${activity}${teacherNote ? ` / ${teacherNote}` : ""}`, createdAt: new Date().toISOString(), status: "검토 완료" });
      setStage(4);
    }, 1450);
  };

  const saveResult = () => {
    if (!result) return;
    const next = [result, ...history];
    setHistory(next); window.localStorage.setItem("tamgu-history", JSON.stringify(next));
    setNotice("결과가 저장되었습니다. 저장 내역에서 다시 확인할 수 있습니다.");
  };

  const reset = () => { setResult(null); setStage(0); setNotice(""); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => { setView("write"); reset(); }}><span className="brand-mark">탐</span><span>탐구한장</span></button>
        <div className="topbar-actions"><span className="secure-pill"><i /> 교사 작업공간</span><button className="avatar" onClick={() => setView("settings")}>김</button></div>
      </header>

      <div className="app-grid">
        <aside className="sidebar">
          <div className="workspace-label">MY WORKSPACE</div>
          <nav>
            <button className={view === "write" ? "nav-item active" : "nav-item"} onClick={() => setView("write")}><span>✦</span> 세특 초안 만들기</button>
            <button className={view === "history" ? "nav-item active" : "nav-item"} onClick={() => setView("history")}><span>▤</span> 저장 내역 <em>{history.length || ""}</em></button>
          </nav>
          <div className="sidebar-divider" />
          <button className={view === "settings" ? "nav-item active" : "nav-item"} onClick={() => setView("settings")}><span>⚙</span> 개인 설정</button>
          <div className="sidebar-bottom"><div className="tip-icon">i</div><p><strong>작성 팁</strong><br />관찰한 행동과 활동 과정을 구체적으로 적을수록 더 자연스러운 초안이 만들어져요.</p></div>
        </aside>

        <section className="content">
          {view === "write" && <>
            <div className="page-heading"><div><div className="eyebrow">INPUT → PROCESS → OUTPUT</div><h1>세특 초안 만들기</h1><p>학생의 활동을 정리하고, 과목별 문구를 한 장씩 완성해 보세요.</p></div><div className="heading-badge"><span>AI 3단계 검토</span><small>수집 · 작성 · 검토</small></div></div>
            <div className="stepper"><div className="step active"><b>1</b><span>활동 입력</span></div><div className={stage > 0 ? "step active" : "step"}><b>2</b><span>AI 에이전트 작업</span></div><div className={stage === 4 ? "step active" : "step"}><b>3</b><span>결과 확인</span></div></div>
            {notice && <div className="notice">{notice}</div>}
            {!result ? <form className="form-layout" onSubmit={generate}>
              <div className="card form-card"><div className="card-title"><span className="number">01</span><div><h2>기본 정보</h2><p>어떤 학생의 어떤 과목 기록인지 알려주세요.</p></div></div><div className="field-grid"><label>학생 식별값<input value={student} onChange={e => setStudent(e.target.value)} placeholder="예: STU-001" /></label><label>학년<select value={grade} onChange={e => setGrade(e.target.value)}><option>중학교 1학년</option><option>중학교 2학년</option><option>중학교 3학년</option><option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option></select></label><label>과목<select value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label><label>기간<input value={term} onChange={e => setTerm(e.target.value)} /></label></div></div>
              <div className="card form-card"><div className="card-title"><span className="number">02</span><div><h2>학생 활동과 관찰 내용</h2><p>관찰한 행동, 사용한 방법, 학생의 말과 결과를 중심으로 입력하세요.</p></div></div><label>활동 키워드<textarea value={activity} onChange={e => setActivity(e.target.value)} placeholder="예: 토론 참여, 자료 조사, 실험 설계" /></label><div className="inline-label"><label>활동 유형<select value={activityType} onChange={e => setActivityType(e.target.value)}><option>탐구·실험</option><option>발표·토론</option><option>프로젝트</option><option>협력 활동</option><option>수업 참여</option></select></label><button type="button" className="ghost-button" onClick={() => { setActivity("온도 변화 측정, 실험 결과 표 작성, 그래프 작성, 오차 원인 분석"); setObservation(sample); }}>예시 입력</button></div><label>교사 관찰 내용<textarea className="large" value={observation} onChange={e => setObservation(e.target.value)} placeholder="학생이 실제로 한 행동과 그 과정에서 확인한 근거를 적어주세요." /></label><label>교사 추가 메모 <span className="optional">선택</span><input value={teacherNote} onChange={e => setTeacherNote(e.target.value)} placeholder="특히 살리고 싶은 과정이나 표현이 있다면 적어주세요." /></label><div className="form-footer"><span className="privacy-note">♧ 학생 이름 대신 식별값을 사용해 주세요.</span><button className="primary-button" disabled={!ready}>세특 초안 생성하기 <span>→</span></button></div></div>
            </form> : <ResultPanel result={result} onSave={saveResult} onReset={reset} onChange={text => setResult({ ...result, finalText: text })} />}
            {stage > 0 && stage < 4 && <div className="agent-strip"><div className={stage >= 1 ? "agent done" : "agent"}><b>01</b><span>수집 에이전트<small>활동 내용 구조화</small></span>{stage >= 1 && <i>✓</i>}</div><div className={stage >= 2 ? "agent done" : "agent"}><b>02</b><span>작성 에이전트<small>과목별 문구 작성</small></span>{stage >= 2 && <i>✓</i>}</div><div className={stage >= 3 ? "agent done" : "agent"}><b>03</b><span>검토 에이전트<small>표현 및 규정 점검</small></span>{stage >= 3 && <i>✓</i>}</div></div>}
          </>}
          {view === "history" && <History results={history} onOpen={r => { setResult(r); setView("write"); setStage(4); }} />}
          {view === "settings" && <Settings model={model} apiKey={apiKey} setModel={setModel} setApiKey={setApiKey} />}
        </section>
      </div>
      <footer>탐구한장 · AI가 만든 결과는 참고용 초안이며, 최종 기록 전 교사의 확인이 필요합니다.</footer>
    </main>
  );
}

function ResultPanel({ result, onSave, onReset, onChange }: { result: Result; onSave: () => void; onReset: () => void; onChange: (text: string) => void }) {
  return <div className="result-wrap"><div className="result-header"><div><div className="eyebrow">OUTPUT · REVIEWED DRAFT</div><h2>검토가 끝났어요</h2><p>과목별로 확인하고 필요한 부분을 직접 다듬어 보세요.</p></div><span className="review-chip">✓ 검토 완료</span></div><div className="result-meta"><span><b>학생</b>{result.studentIdentifier}</span><span><b>학년</b>{result.grade}</span><span><b>과목</b>{result.subject}</span><span><b>생성일</b>{new Date(result.createdAt).toLocaleDateString("ko-KR")}</span></div><div className="result-card"><div className="result-card-top"><span className="subject-tag">{result.subject}</span><span className="draft-label">AI 초안 · 교사 확인 필요</span></div><textarea value={result.finalText} onChange={e => onChange(e.target.value)} /><div className="evidence"><b>검토 메모</b><span>입력된 관찰 내용을 기반으로 작성했으며, 비교·순위·단정적 표현을 사용하지 않았습니다.</span></div><div className="result-actions"><button className="secondary-button" onClick={() => navigator.clipboard?.writeText(result.finalText)}>문구 복사</button><button className="secondary-button" onClick={() => { const blob = new Blob([result.finalText], { type: "text/plain;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${result.subject}-세특-초안.txt`; a.click(); }}>TXT 다운로드</button><button className="secondary-button" onClick={onReset}>다시 작성</button><button className="primary-button" onClick={onSave}>Supabase에 저장 <span>→</span></button></div></div></div>;
}

function History({ results, onOpen }: { results: Result[]; onOpen: (result: Result) => void }) { return <div className="simple-page"><div className="page-heading"><div><div className="eyebrow">ARCHIVE</div><h1>저장 내역</h1><p>생성한 세특 초안을 다시 확인하고 이어서 수정할 수 있습니다.</p></div><span className="count-badge">{results.length}건</span></div><div className="history-card">{results.length === 0 ? <div className="empty"><span>▤</span><h3>아직 저장된 결과가 없어요</h3><p>세특 초안을 생성하고 저장하면 이곳에서 다시 볼 수 있습니다.</p></div> : results.map(r => <button className="history-row" key={r.id} onClick={() => onOpen(r)}><span className="subject-dot">{r.subject.slice(0, 1)}</span><span className="history-main"><b>{r.subject} · {r.studentIdentifier}</b><small>{r.grade} · {new Date(r.createdAt).toLocaleDateString("ko-KR")}</small></span><span className="history-preview">{r.finalText.slice(0, 58)}...</span><span className="arrow">→</span></button>)}</div></div>; }

function Settings({ model, apiKey, setModel, setApiKey }: { model: string; apiKey: string; setModel: (value: string) => void; setApiKey: (value: string) => void }) { return <div className="simple-page"><div className="page-heading"><div><div className="eyebrow">PERSONAL SETTINGS</div><h1>개인 설정</h1><p>AI 초안 생성에 사용할 모델과 개인 환경을 설정하세요.</p></div></div><div className="settings-card"><div className="settings-section"><h2>Gemini 연결</h2><p>API Key는 브라우저에 저장하지 않고 서버 환경변수 또는 안전한 서버 저장소에서 관리하는 것을 권장합니다.</p><label>Gemini API Key<input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." /></label><label>선호 모델<select value={model} onChange={e => setModel(e.target.value)}><option>Gemini 3.5 Flash-Lite</option><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Pro</option></select></label><button className="primary-button" onClick={() => alert("개인 설정이 저장되었습니다.")}>설정 저장 <span>→</span></button></div><div className="settings-section muted-section"><h2>작성 원칙</h2><div className="rule"><span>✓</span> 관찰 사실과 해석을 구분합니다.</div><div className="rule"><span>✓</span> 비교·순위·과장 표현을 줄입니다.</div><div className="rule"><span>✓</span> 최종 기록 전 교사가 확인합니다.</div></div></div></div>; }
