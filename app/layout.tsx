import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "탐구한장 | 과목별 세특 초안 작성",
  description: "학생 활동을 정리하고 과목별 세특 초안을 검토·저장하는 교사용 웹앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
