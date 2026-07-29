"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Point = { x: string; y: string };
type ChartType = "line" | "bar" | "pie" | "band" | "scatter";

const initialRows: Point[] = [
  { x: "0", y: "25.0" }, { x: "2", y: "42.0" }, { x: "4", y: "61.0" },
  { x: "6", y: "78.0" }, { x: "8", y: "95.0" }, { x: "10", y: "100.0" },
];
const variableOptions = ["시간", "온도", "압력", "부피", "질량", "무게", "힘의 크기", "길이"];
const unitOptions = ["℃", "g", "kg", "N", "mL", "L", "mm", "cm", "m", "기압", "s", "min"];

function toNumber(value: string) { return Number(value.trim()); }
function usableRows(rows: Point[]) { return rows.filter((row) => Number.isFinite(toNumber(row.x)) && Number.isFinite(toNumber(row.y))); }

function Graph({ points, xName, yName, xUnit, yUnit, chartType = "line", compact = false }: { points: Point[]; xName: string; yName: string; xUnit: string; yUnit: string; chartType?: ChartType; compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ratio = window.devicePixelRatio || 1; const width = canvas.clientWidth; const height = canvas.clientHeight;
    canvas.width = Math.max(1, width * ratio); canvas.height = Math.max(1, height * ratio);
    const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    const left = compact ? 48 : 62, right = 24, top = 28, bottom = compact ? 42 : 54;
    const chartWidth = width - left - right, chartHeight = height - top - bottom;
    const xs = points.map((p) => toNumber(p.x)), ys = points.map((p) => toNumber(p.y));
    const minX = xs.length ? Math.min(...xs) : 0, maxX = xs.length ? Math.max(...xs) : 10;
    const minY = ys.length ? Math.min(...ys) : 0, maxY = ys.length ? Math.max(...ys) : 10;
    const xPad = Math.max((maxX - minX) * .08, 1), yPad = Math.max((maxY - minY) * .14, 1);
    const x0 = minX - xPad, x1 = maxX + xPad, y0 = Math.min(0, minY - yPad), y1 = maxY + yPad;
    const px = (x: number) => left + ((x - x0) / Math.max(x1 - x0, 1)) * chartWidth;
    const py = (y: number) => top + chartHeight - ((y - y0) / Math.max(y1 - y0, 1)) * chartHeight;
    ctx.font = `${compact ? 10 : 12}px Arial`; ctx.strokeStyle = "#e3eaf4"; ctx.fillStyle = "#718096"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i += 1) {
      const gx = left + chartWidth * i / 5, gy = top + chartHeight * i / 5;
      ctx.beginPath(); ctx.moveTo(gx, top); ctx.lineTo(gx, top + chartHeight); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left, gy); ctx.lineTo(left + chartWidth, gy); ctx.stroke();
      ctx.fillText((x0 + (x1 - x0) * i / 5).toFixed(1), gx - 10, top + chartHeight + (compact ? 17 : 22));
      ctx.fillText((y1 - (y1 - y0) * i / 5).toFixed(1), 4, gy + 4);
    }
    ctx.strokeStyle = "#3b69d9"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, top + chartHeight); ctx.lineTo(left + chartWidth, top + chartHeight); ctx.stroke();
    if (chartType === "pie" && points.length) {
      const total = ys.reduce((sum, value) => sum + Math.max(value, 0), 0) || 1; let start = -Math.PI / 2;
      points.forEach((point, index) => { const slice = Math.max(toNumber(point.y), 0) / total * Math.PI * 2; ctx.beginPath(); ctx.moveTo(width / 2, top + chartHeight / 2); ctx.arc(width / 2, top + chartHeight / 2, Math.min(chartWidth, chartHeight) * .36, start, start + slice); ctx.closePath(); ctx.fillStyle = ["#3b69d9", "#6e8fe5", "#91b0ed", "#a9c6f3", "#c2d7f7", "#d8e5fa"][index % 6]; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); start += slice; });
    } else if (chartType === "bar") {
      const barWidth = Math.max(8, chartWidth / Math.max(points.length * 1.7, 2)); points.forEach((point, index) => { const x = left + chartWidth * (index + .5) / points.length; const topY = py(toNumber(point.y)); ctx.fillStyle = "#5b7fdb"; ctx.fillRect(x - barWidth / 2, topY, barWidth, top + chartHeight - topY); });
    } else if (chartType === "band") {
      const bandY = top + chartHeight * .43; ctx.fillStyle = "#a8c0eb"; ctx.fillRect(left, bandY, chartWidth, chartHeight * .22); ctx.strokeStyle = "#3b69d9"; ctx.lineWidth = 2; ctx.strokeRect(left, bandY, chartWidth, chartHeight * .22); points.forEach((_, index) => { const x = left + chartWidth * (index + .5) / points.length; ctx.fillStyle = "#2f62ca"; ctx.fillRect(x - 2, bandY - 8, 4, chartHeight * .22 + 16); });
    } else {
      if (chartType === "line" && points.length) { ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(px(toNumber(point.x)), py(toNumber(point.y))) : ctx.moveTo(px(toNumber(point.x)), py(toNumber(point.y)))); ctx.strokeStyle = "#3b69d9"; ctx.lineWidth = 2.5; ctx.stroke(); }
      points.forEach((point) => { ctx.beginPath(); ctx.arc(px(toNumber(point.x)), py(toNumber(point.y)), compact ? 4 : 6, 0, Math.PI * 2); ctx.fillStyle = "#3b69d9"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); });
    }
    ctx.fillStyle = "#41536f"; ctx.font = `600 ${compact ? 10 : 12}px Arial`; ctx.fillText(`${yName || "종속 변인"}${yUnit ? ` (${yUnit})` : ""}`, left, 14); ctx.fillText(`${xName || "독립 변인"}${xUnit ? ` (${xUnit})` : ""}`, Math.max(left, width / 2 - 40), height - 8);
  }, [points, xName, yName, xUnit, yUnit, chartType, compact]);
  return <canvas ref={ref} className={compact ? "graph-canvas compact" : "graph-canvas"} aria-label="실험 데이터 그래프" />;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("물이 끓을 때의 온도 측정하기");
  const [student, setStudent] = useState("202470509");
  const [goal, setGoal] = useState("물이 끓을 때의 온도를 측정하여 그래프로 나타낼 수 있다.");
  const [xName, setXName] = useState("시간"); const [xUnit, setXUnit] = useState("min"); const [yName, setYName] = useState("온도"); const [yUnit, setYUnit] = useState("℃");
  const [rows, setRows] = useState<Point[]>(initialRows); const [chartType, setChartType] = useState<ChartType>("line");
  const [analysis, setAnalysis] = useState("물의 온도가 서서히 높아지다가 물이 끓기 시작하면 온도가 더 올라가지 않고 일정하게 유지된다.");
  const [principle, setPrinciple] = useState("물이 흡수한 열에너지가 수증기로 상태 변화 하는 데 모두 사용되기 때문이다.");
  const [errorCause, setErrorCause] = useState("온도계의 끝이 삼각 플라스크 바닥에 닿았다.");
  const [conclusion, setConclusion] = useState("물이 흡수한 열에너지가 수증기로 상태 변화 하는 데 모두 사용되기 때문에 물을 가열할 때 물의 온도가 서서히 높아지다가 물이 끓기 시작하면 온도가 더 올라가지 않고 일정하게 유지된다.");
  const [notice, setNotice] = useState("");
  const points = useMemo(() => usableRows(rows), [rows]);
  const updateRow = (index: number, field: keyof Point, event: ChangeEvent<HTMLInputElement>) => setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: event.target.value } : row));
  const goGraph = () => { if (points.length < 2) { setNotice("그래프를 만들려면 숫자로 된 측정값을 2개 이상 입력해 주세요."); return; } setNotice(""); setStep(2); };

  return <main className="lab-shell">
    <header className="topbar"><button className="brand" onClick={() => { setStep(1); setNotice(""); }}><span className="brand-mark">탐</span><span>탐구한장</span></button><span className="topbar-sub">과학 실험 데이터 시각화 · 결과지 작성</span><button className="user-button">♙</button></header>
    <section className="hero"><div><div className="eyebrow">SCIENCE EXPERIMENT REPORT</div><h1>실험 데이터를 한 장의<br /><em>탐구 결과지</em>로 완성해요.</h1><p>측정값을 입력하면 실제 수치 간격을 반영한 그래프가 만들어지고,<br />간단한 질문에 답하며 실험 결과를 정리할 수 있어요.</p></div><div className="hero-note character-note"><div className="student-character"><span>🧑‍🔬</span><i>⚗</i></div><small>오늘의 실험</small><strong>측정하고, 관찰하고,<br />탐구를 완성해요!</strong></div></section>
    <nav className="steps" aria-label="보고서 작성 단계"><button className={step === 1 ? "active" : step > 1 ? "done" : ""} onClick={() => step > 1 && setStep(1)}><b>1</b><span>실험 데이터 입력</span><small>측정값과 변인</small></button><i /><button className={step === 2 ? "active" : step > 2 ? "done" : ""} onClick={() => step > 2 && setStep(2)}><b>2</b><span>그래프 및 분석</span><small>변화 관계 해석</small></button><i /><button className={step === 3 ? "active" : ""} onClick={() => step === 3 && setStep(3)}><b>3</b><span>실험 결과지</span><small>한 장으로 완성</small></button></nav>
    {notice && <p className="notice" role="alert">{notice}</p>}
    {step === 1 && <section className="workspace two-col"><div className="card"><div className="section-title"><span>01</span><div><h2>기본 정보</h2><p>실험의 제목과 변인을 입력해 주세요.</p></div></div><label>실험 제목<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>학번<input value={student} onChange={(e) => setStudent(e.target.value)} /></label><label>실험 목표<textarea value={goal} onChange={(e) => setGoal(e.target.value)} /></label><div className="section-title compact-title"><span>02</span><div><h2>변인 설정</h2><p>독립 변인과 종속 변인, 단위를 선택해 주세요.</p></div></div><div className="variable-grid"><label>독립 변인<select value={xName} onChange={(e) => setXName(e.target.value)}>{variableOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>단위<select value={xUnit} onChange={(e) => setXUnit(e.target.value)}>{unitOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>종속 변인<select value={yName} onChange={(e) => setYName(e.target.value)}>{variableOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>단위<select value={yUnit} onChange={(e) => setYUnit(e.target.value)}>{unitOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div></div><div className="card"><div className="section-title"><span>03</span><div><h2>측정 데이터</h2><p>정수와 소수점 값을 그대로 입력해 주세요.</p></div></div><div className="table-wrap"><table><thead><tr><th>횟수</th><th>{xName || "X값"} ({xUnit})</th><th>{yName || "Y값"} ({yUnit})</th><th /></tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td>{index + 1}</td><td><input inputMode="decimal" value={row.x} onChange={(e) => updateRow(index, "x", e)} /></td><td><input inputMode="decimal" value={row.y} onChange={(e) => updateRow(index, "y", e)} /></td><td>{rows.length > 2 && <button className="delete-row" onClick={() => setRows((current) => current.filter((_, i) => i !== index))}>×</button>}</td></tr>)}</tbody></table></div><div className="data-actions"><button className="secondary-button" onClick={() => setRows((current) => [...current, { x: "", y: "" }])}>＋ 행 추가</button><button className="primary-button" onClick={goGraph}>그래프 만들기 <span>→</span></button></div><div className="data-tip"><b>ⓘ</b><span><strong>소수점까지 정확하게 입력해 주세요!</strong><br />예: 10.0, 15.0, 1.2, 2.7처럼 실제 수치 간격으로 그래프에 표시됩니다.</span></div></div></section>}
    {step === 2 && <section className="workspace graph-layout"><div className="card graph-panel"><div className="section-title"><span>01</span><div><h2>자동 생성된 그래프</h2><p>측정값 사이의 실제 간격을 반영합니다.</p></div></div><div className="mini-table"><table><thead><tr><th>횟수</th><th>{xName} ({xUnit})</th><th>{yName} ({yUnit})</th></tr></thead><tbody>{points.map((p, i) => <tr key={i}><td>{i + 1}</td><td>{p.x}</td><td>{p.y}</td></tr>)}</tbody></table></div><div className="graph-options"><span>그래프 유형</span><select value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)}><option value="line">꺾은선 그래프</option><option value="bar">막대그래프</option><option value="pie">원그래프</option><option value="band">띠그래프</option><option value="scatter">점그래프(산점도)</option></select></div><Graph points={points} xName={xName} yName={yName} xUnit={xUnit} yUnit={yUnit} chartType={chartType} /></div><div className="card analysis-panel"><div className="section-title"><span>02</span><div><h2>결과 분석</h2><p>필요한 항목만 작성해도 다음 단계로 이동할 수 있어요.</p></div></div><label>결과 분석<textarea value={analysis} onChange={(e) => setAnalysis(e.target.value)} placeholder="그래프에서 어떤 변화가 보이나요?" /></label><label>과학적 원리<textarea value={principle} onChange={(e) => setPrinciple(e.target.value)} placeholder="이 결과와 관련된 과학적 원리는 무엇인가요?" /></label><label>오차 원인<textarea value={errorCause} onChange={(e) => setErrorCause(e.target.value)} placeholder="실험 결과에 영향을 준 오차 원인은 무엇인가요?" /></label><label>결론<textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} placeholder="실험을 통해 무엇을 알게 되었나요?" /></label><div className="data-actions"><button className="secondary-button" onClick={() => setStep(1)}>← 수정</button><button className="primary-button" onClick={() => setStep(3)}>결과지 미리보기 <span>→</span></button></div></div></section>}
    {step === 3 && <section className="result-area"><div className="result-actions no-print"><button className="secondary-button" onClick={() => setStep(2)}>← 수정하기</button><button className="primary-button" onClick={() => window.print()}>인쇄 / PDF 저장 <span>▣</span></button></div><article className="report"><header><div className="report-kicker">탐구한장 · SCIENCE EXPERIMENT REPORT</div><h2>실험 결과지</h2><p>학번: {student || "입력하지 않음"}</p></header><section><h3>1. 실험 제목</h3><p className="answer strong">{title || "실험 제목을 입력해 주세요."}</p></section><section><h3>2. 실험 목표</h3><p className="answer">{goal || "실험 목표를 입력해 주세요."}</p></section><div className="report-grid"><section><h3>3. 실험 결과 표</h3><table><thead><tr><th>횟수</th><th>{xName} ({xUnit})</th><th>{yName} ({yUnit})</th></tr></thead><tbody>{points.map((p, i) => <tr key={i}><td>{i + 1}</td><td>{p.x}</td><td>{p.y}</td></tr>)}</tbody></table></section><section><h3>4. 그래프</h3><Graph points={points} xName={xName} yName={yName} xUnit={xUnit} yUnit={yUnit} chartType={chartType} compact /></section></div><section><h3>5. 결과 분석</h3><p className="answer">{analysis}</p></section><section><h3>6. 과학적 원리</h3><p className="answer">{principle}</p></section><section><h3>7. 오차 원인</h3><p className="answer">{errorCause}</p></section><section><h3>8. 결론</h3><p className="answer">{conclusion}</p></section></article></section>}
    <footer>✣ 탐구한장 <span>한 장으로, 실험이 정리된다!</span><small>데이터 입력 → 자동 생성 → 한 장으로 완성</small></footer>
  </main>;
}
