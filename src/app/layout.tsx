import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAInit from "@/components/PWAInit";
import InstallBanner from "@/components/InstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사장님의 경영 파트너 - 소상공인 실수령액 계산기",
  description: "매출에서 세금, 보험, 원가를 빼고 진짜 내 손에 남는 돈을 계산합니다. AI 경영 조언과 전문가 연결까지.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "경영파트너",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D5A8E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PWAInit />
        <InstallBanner />
      </body>
    </html>
  );
}
