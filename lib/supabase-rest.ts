export type SavedReport = {
  id: string;
  created_at: string;
  title: string;
  student_name: string;
  report_data: {
    title: string;
    student: string;
    goal: string;
    xName: string;
    xUnit: string;
    yName: string;
    yUnit: string;
    rows: { x: string; y: string }[];
    chartType: string;
    analysis: string;
    principle: string;
    errorCause: string;
    conclusion: string;
  };
};

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(baseUrl && anonKey);

function endpoint(path: string) {
  if (!baseUrl || !anonKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return `${baseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
}

function headers() {
  return { apikey: anonKey ?? "", Authorization: `Bearer ${anonKey ?? ""}`, "Content-Type": "application/json" };
}

export async function listReports() {
  const response = await fetch(endpoint("experiment_reports?select=*&order=created_at.desc"), { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<SavedReport[]>;
}

export async function saveReport(report: Omit<SavedReport, "id" | "created_at">) {
  const response = await fetch(endpoint("experiment_reports"), { method: "POST", headers: { ...headers(), Prefer: "return=representation" }, body: JSON.stringify(report) });
  if (!response.ok) throw new Error(await response.text());
  const rows = await response.json() as SavedReport[];
  return rows[0];
}

export async function deleteReport(id: string) {
  const response = await fetch(endpoint(`experiment_reports?id=eq.${encodeURIComponent(id)}`), { method: "DELETE", headers: headers() });
  if (!response.ok) throw new Error(await response.text());
}
