export type SavedReport = {
  id: string;
  created_at: string;
  title: string;
  student_name: string;
  class_number?: number | null;
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

export type TeacherSession = { access_token: string; user: { id: string; email?: string } };

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase now labels the browser-safe key as PUBLISHABLE_KEY.
// Keep ANON_KEY as a backwards-compatible fallback for existing deployments.
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(baseUrl && anonKey);

function sessionStudentCode() {
  return typeof window === "undefined" ? "" : window.sessionStorage.getItem("탐구한장:student") || "";
}

function endpoint(path: string) {
  if (!baseUrl || !anonKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return `${baseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
}

function headers() {
  return { apikey: anonKey ?? "", Authorization: `Bearer ${anonKey ?? ""}`, "Content-Type": "application/json" };
}

function authEndpoint(path: string) {
  if (!baseUrl || !anonKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return `${baseUrl.replace(/\/$/, "")}/auth/v1/${path}`;
}

export async function signInTeacher(email: string, password: string) {
  const response = await fetch(authEndpoint("token?grant_type=password"), { method: "POST", headers: headers(), body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<TeacherSession>;
}

export async function listTeacherReports(accessToken: string) {
  const response = await fetch(endpoint("experiment_reports?select=*&order=created_at.desc"), { headers: { ...headers(), Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<SavedReport[]>;
}

export async function verifyStudentAccess(studentCode: string, pin: string) {
  const response = await fetch(endpoint("rpc/verify_student_access"), { method: "POST", headers: headers(), body: JSON.stringify({ p_student_code: studentCode, p_pin: pin }) });
  if (!response.ok) throw new Error(await response.text());
  const valid = await response.json() as boolean;
  if (!valid) return false;
  const classResponse = await fetch(endpoint("rpc/get_student_class"), { method: "POST", headers: headers(), body: JSON.stringify({ p_student_code: studentCode, p_pin: pin }) });
  if (!classResponse.ok) throw new Error(await classResponse.text());
  const classNumber = await classResponse.json() as number | null;
  if (typeof window !== "undefined" && classNumber) window.sessionStorage.setItem("탐구한장:class", String(classNumber));
  return Boolean(classNumber);
}

export async function getStudentClass(studentCode: string, pin: string) {
  const response = await fetch(endpoint("rpc/get_student_class"), { method: "POST", headers: headers(), body: JSON.stringify({ p_student_code: studentCode, p_pin: pin }) });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<number | null>;
}

export async function listReports(studentCode?: string) {
  const currentStudent = studentCode || sessionStudentCode();
  if (!currentStudent) return [];
  const filter = `&student_name=eq.${encodeURIComponent(currentStudent)}`;
  const response = await fetch(endpoint(`experiment_reports?select=*&order=created_at.desc${filter}`), { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<SavedReport[]>;
}

export async function saveReport(report: Omit<SavedReport, "id" | "created_at">) {
  const currentStudent = sessionStudentCode();
  const currentClass = typeof window === "undefined" ? null : Number(window.sessionStorage.getItem("탐구한장:class")) || null;
  const response = await fetch(endpoint("experiment_reports"), { method: "POST", headers: { ...headers(), Prefer: "return=representation" }, body: JSON.stringify(currentStudent ? { ...report, student_name: currentStudent, class_number: currentClass } : report) });
  if (!response.ok) throw new Error(await response.text());
  const rows = await response.json() as SavedReport[];
  return rows[0];
}

export async function deleteReport(id: string) {
  const response = await fetch(endpoint(`experiment_reports?id=eq.${encodeURIComponent(id)}`), { method: "DELETE", headers: headers() });
  if (!response.ok) throw new Error(await response.text());
}
