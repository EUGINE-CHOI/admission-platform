import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "입시 로드맵 | 정보 격차 해소 플랫폼",
  description: "중학생과 학부모를 위한 고등학교 입시 준비 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}




