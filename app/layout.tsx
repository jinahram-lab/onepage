import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "탐구한장 | 과학 실험 결과지",
  description: "실험 데이터를 그래프로 시각화하고 한 장의 탐구 결과지로 정리하는 웹앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
