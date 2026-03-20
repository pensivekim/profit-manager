import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/" className="font-semibold" style={{ color: 'var(--accent)', fontSize: '14px' }}>
          {"\u2190"} 홈
        </Link>

        <h1 className="font-bold mt-6 mb-2" style={{ fontSize: '24px', color: 'var(--text-primary)' }}>
          개인정보처리방침
        </h1>
        <p className="mb-6" style={{ fontSize: '13px', color: 'var(--text-hint)' }}>시행일: 2026년 3월 20일</p>

        <div className="space-y-6" style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>1. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>카카오 로그인:</strong> 카카오 고유 ID, 닉네임</li>
              <li><strong>서비스 이용:</strong> 업종, 지역, 매출/비용 입력값</li>
              <li><strong>자동 수집:</strong> 서비스 이용 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>2. 개인정보 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스 제공 및 경영 분석</li>
              <li>AI 경영 조언 제공</li>
              <li>전문가 연결 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>3. 개인정보 보유 및 이용 기간</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 탈퇴 시 즉시 삭제</li>
              <li>관계 법령에 따른 보존 기간 준수</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>4. 개인정보의 제3자 제공</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>원칙적으로 제3자에게 제공하지 않음</li>
              <li>전문가 연결 시 사용자 동의 후 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>5. 개인정보 처리 위탁</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cloudflare (서버 운영)</li>
              <li>NHN Cloud (SMS 인증)</li>
              <li>카카오 (소셜 로그인)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>6. 정보주체의 권리</h2>
            <p>개인정보 열람, 수정, 삭제 요청이 가능합니다.</p>
            <p>문의: <a href="mailto:pensive.kim@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>pensive.kim@gmail.com</a></p>
          </section>

          <section className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <p>사업자: 주식회사 제노믹</p>
            <p>대표자: 김창훈</p>
            <p>주소: 대구광역시</p>
            <p>이메일: pensive.kim@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
