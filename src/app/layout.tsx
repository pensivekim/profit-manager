import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInit from "@/components/PWAInit";
import InstallBanner from "@/components/InstallBanner";

export const metadata: Metadata = {
  title: "KBS비즈니스 경영파트너 — 소상공인 실수령액 계산기",
  description: "매달 얼마 남는지 모르는 사장님을 위한 무료 경영 파트너. 세금·보험 다 빼고 진짜 내 손에 남는 돈을 30초 만에 확인하세요. AI 경영 조언과 세무사·노무사 연결까지.",
  keywords: ["소상공인 실수령액", "자영업자 순수익 계산", "사장님 세금 계산기", "식당 수익 계산", "미용실 순이익", "부가세 계산", "종합소득세 예상", "소상공인 AI 경영 조언", "세무사 연결", "노무사 상담", "자영업자 경영관리"],
  authors: [{ name: "주식회사 제노믹" }],
  creator: "주식회사 제노믹",
  publisher: "주식회사 제노믹",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "경영파트너",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://pro.genomic.cc",
    siteName: "KBS비즈니스 경영파트너",
    title: "KBS비즈니스 | 열심히 일했는데, 왜 통장엔 없지?",
    description: "세금 다 빼고 진짜 내 손에 남는 돈을 확인하세요. KBS비즈니스와 함께하는 소상공인 무료 경영파트너.",
    images: [{
      url: "https://pro.genomic.cc/og-image-v2.png",
      width: 1200,
      height: 630,
      alt: "사장님경영파트너 — KBS비즈니스와 함께",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "열심히 일했는데, 왜 통장엔 없지?",
    description: "세금 다 빼고 진짜 내 손에 남는 돈을 확인하세요. KBS비즈니스와 함께하는 소상공인 무료 경영파트너.",
    images: ["https://pro.genomic.cc/og-image-v2.png"],
  },
  alternates: {
    canonical: "https://pro.genomic.cc",
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
      className="h-full antialiased"
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
