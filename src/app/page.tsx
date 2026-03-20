import Link from 'next/link';
import ShareButton from '@/components/ShareButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "사장님경영파트너",
          "url": "https://pro.genomic.cc",
          "description": "소상공인 실수령액 계산 및 AI 경영 조언 서비스",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
          "provider": { "@type": "Organization", "name": "주식회사 제노믹", "url": "https://genomic.cc" }
        })}}
      />

      {/* [1] 헤더 */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 max-w-5xl mx-auto">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kbs-logo.svg"
            alt="KBS비즈니스"
            className="h-7 md:h-9"
            style={{ objectFit: 'contain' }}
          />
          <span className="block font-semibold" style={{ fontSize: '15px', color: '#4A4A4A', marginTop: '2px' }}>
            소상공인 사장님과 함께 합니다.
          </span>
        </div>
        <Link href="/login"
          className="font-semibold px-5 py-2 rounded-lg text-white"
          style={{ fontSize: '14px', background: '#2D5A8E' }}>
          로그인
        </Link>
      </header>

      {/* [2] 히어로 — PC: 좌우 배치, 모바일: 세로 */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-10 md:pb-20">
        <div className="md:flex md:items-center md:gap-16">
          {/* 왼쪽: 텍스트 */}
          <div className="md:flex-1 text-center md:text-left">
            <h1 className="font-bold text-3xl md:text-5xl" style={{ color: '#1A1A1A', lineHeight: '1.35' }}>
              열심히 일했는데,<br />왜 통장엔 없지?
            </h1>
            <p className="mt-5 md:mt-6 text-base md:text-lg" style={{ color: '#4A4A4A', lineHeight: '1.9' }}>
              매달 수백만원 매출을 올리면서도<br />
              정작 내 손에 남는 돈이 얼마인지<br />
              모르는 사장님이 대부분입니다.
            </p>
          </div>
          {/* 오른쪽: CTA */}
          <div className="md:w-96 mt-8 md:mt-0">
            <a href="/api/auth/kakao"
              className="block w-full rounded-2xl font-bold hover:brightness-95 active:scale-[0.98] transition-all kakao-glow text-center"
              style={{
                background: '#FEE500', color: '#191919',
                fontSize: '19px', height: '60px', lineHeight: '60px',
                boxShadow: '0 4px 14px rgba(254, 229, 0, 0.5)',
              }}>
              {"\uD83D\uDCAC"} 카카오로 무료 시작하기
            </a>
            <p className="mt-3 text-center" style={{ fontSize: '13px', color: '#9A9690' }}>
              가입 5초 · 완전 무료 · 카드 불필요
            </p>
            <div className="mt-4 rounded-xl px-4 py-3 flex items-center justify-center gap-2"
              style={{ background: 'rgba(45, 90, 142, 0.08)', border: '1px solid rgba(45, 90, 142, 0.15)' }}>
              <span style={{ fontSize: '18px' }}>{"\uD83D\uDD12"}</span>
              <span className="font-semibold" style={{ fontSize: '14px', color: '#2D5A8E', lineHeight: '1.5' }}>
                입력하신 데이터는 외부에 유출되거나 공유되지 않습니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* [3] 공감 섹션 — PC: 가로 3열, 모바일: 세로 */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-10 md:pb-16">
        <h2 className="font-bold text-center mb-5 md:mb-8 text-2xl md:text-3xl" style={{ color: '#1A1A1A', lineHeight: '1.4' }}>
          혹시 이런 적 있으신가요?
        </h2>
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {[
            { emoji: '\uD83D\uDE24', title: '이번 달도 바빴는데 왜 이러지?', desc: '매출은 올랐는데 수중에 남는 게 없어요' },
            { emoji: '\uD83D\uDE30', title: '세금 낼 때마다 깜짝 놀란다', desc: '부가세, 소득세... 미리 알았으면 준비했을 텐데' },
            { emoji: '\uD83D\uDE13', title: '직원 월급 주고 나면 내 몫이 없다', desc: '나는 사장인지 직원인지 모르겠어요' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl p-5 md:p-6 border" style={{ background: '#FFFDF7', borderColor: '#E8E3DA' }}>
              <div className="flex items-start gap-3 md:flex-col">
                <span className="text-2xl md:text-4xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-bold md:mt-3" style={{ fontSize: '17px', color: '#1A1A1A', lineHeight: '1.5' }}>{item.title}</p>
                  <p className="mt-1" style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* [4] 해결책 섹션 — PC: 4열, 모바일: 2열 */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-10 md:pb-16">
        <h2 className="font-bold text-center mb-5 md:mb-8 text-2xl md:text-3xl" style={{ color: '#1A1A1A', lineHeight: '1.4' }}>
          이제 숫자로 확인하세요
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { emoji: '\uD83E\uDDEE', title: '진짜 남은 돈', desc: '세금·보험·수수료 다 빼고\n내 손에 얼마 남는지' },
            { emoji: '\uD83D\uDCCA', title: '지역별 업종 평균 비교', desc: '우리 동네 식당 평균이랑\n내 가게가 어떻게 다른지' },
            { emoji: '\uD83E\uDD16', title: 'AI 경영 조언', desc: '재료비가 왜 높은지,\n어떻게 줄일 수 있는지' },
            { emoji: '\uD83D\uDCE2', title: '최신 혜택·블로그 글감', desc: '지원금·마케팅 아이디어·\n블로그 주제까지 한번에' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl p-5 md:p-6 border" style={{ background: '#FFFDF7', borderColor: '#E8E3DA' }}>
              <span className="text-2xl md:text-3xl block mb-2">{item.emoji}</span>
              <p className="font-bold" style={{ fontSize: '16px', color: '#1A1A1A', lineHeight: '1.4' }}>{item.title}</p>
              <p className="mt-1 whitespace-pre-line" style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.7' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* [5] 사용 업종 섹션 — PC: 넓게 */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-10 md:pb-16">
        <h2 className="font-bold text-center mb-5 md:mb-8 text-2xl md:text-3xl" style={{ color: '#1A1A1A', lineHeight: '1.4' }}>
          어떤 사장님이든 괜찮아요
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 md:gap-3">
          {[
            { emoji: '\uD83C\uDF5C', label: '식당/카페' },
            { emoji: '\u2702\uFE0F', label: '미용실' },
            { emoji: '\uD83D\uDEB4', label: '배달/퀵' },
            { emoji: '\uD83D\uDC84', label: '방문판매' },
            { emoji: '\uD83D\uDCBB', label: '프리랜서' },
            { emoji: '\uD83D\uDE95', label: '대리운전' },
            { emoji: '\uD83C\uDFEA', label: '소매/편의점' },
            { emoji: '\uD83D\uDD27', label: '제조/공방' },
            { emoji: '\uD83D\uDCDA', label: '학원/서비스' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl py-3 md:py-4 text-center border" style={{ background: '#FFFDF7', borderColor: '#E8E3DA' }}>
              <span className="text-xl md:text-2xl block">{item.emoji}</span>
              <span className="mt-1 block font-medium" style={{ fontSize: '13px', color: '#4A4A4A' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* [6] 한 줄 강조 — PC: 크게 */}
      <section style={{ background: '#2D5A8E' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 text-center">
          <p className="font-bold text-white text-xl md:text-3xl" style={{ lineHeight: '1.7' }}>
            혼자 고민하지 마세요.<br />
            숫자를 알면 길이 보입니다.
          </p>
          <a href="/api/auth/kakao"
            className="inline-block mt-6 md:mt-8 rounded-xl font-bold hover:opacity-90 transition-opacity px-10 md:px-16"
            style={{ background: '#FEE500', color: '#191919', fontSize: '17px', height: '52px', lineHeight: '52px' }}>
            지금 무료로 시작하기
          </a>
        </div>
      </section>

      {/* 공유 */}
      <ShareButton />

      {/* [7] 푸터 */}
      <footer className="max-w-5xl mx-auto px-4 md:px-8 py-8 text-center" style={{ background: '#F5F0E8' }}>
        <p style={{ fontSize: '13px', color: '#9A9690', lineHeight: '1.8' }}>
          &copy; 2026 사장님경영파트너 · 주식회사 제노믹
        </p>
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          <Link href="/terms" style={{ color: '#9A9690' }}>이용약관</Link>
          <span style={{ color: '#CCC' }}> · </span>
          <Link href="/privacy" style={{ color: '#9A9690' }}>개인정보처리방침</Link>
          <span style={{ color: '#CCC' }}> · </span>
          <a href="mailto:pensive.kim@gmail.com" style={{ color: '#9A9690' }}>문의하기</a>
        </div>
        <p className="mt-2" style={{ fontSize: '11px', color: '#C0BBB3' }}>pro.genomic.cc</p>
      </footer>
    </div>
  );
}
