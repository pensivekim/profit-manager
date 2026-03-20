import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/" className="font-semibold" style={{ color: 'var(--accent)', fontSize: '14px' }}>
          {"\u2190"} 홈
        </Link>

        <h1 className="font-bold mt-6 mb-2" style={{ fontSize: '24px', color: 'var(--text-primary)' }}>
          이용약관
        </h1>
        <p className="mb-6" style={{ fontSize: '13px', color: 'var(--text-hint)' }}>시행일: 2026년 3월 20일</p>

        <div className="space-y-6" style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제1조 (목적)</h2>
            <p>본 약관은 주식회사 제노믹이 운영하는 사장님경영파트너(pro.genomic.cc) 서비스 이용에 관한 조건과 절차를 규정합니다.</p>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제2조 (서비스 내용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>소상공인 실수령액 계산 서비스</li>
              <li>AI 경영 조언 서비스</li>
              <li>전문가 연결 서비스</li>
            </ul>
            <p className="mt-2">본 서비스의 계산 결과는 참고용이며, 정확한 세무/법률 상담은 전문가에게 문의하세요.</p>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제3조 (회원가입)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>카카오 계정으로 간편 가입</li>
              <li>만 14세 이상 이용 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제4조 (서비스 이용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>무료 서비스 제공</li>
              <li>서비스 내용은 사전 고지 후 변경 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제5조 (금지행위)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인 정보 도용 금지</li>
              <li>서비스 크롤링/자동화 금지</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>제6조 (면책조항)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>계산 결과는 참고용으로만 사용</li>
              <li>투자/경영 결정의 책임은 이용자에게 있음</li>
            </ul>
          </section>

          <section className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <p>사업자: 주식회사 제노믹</p>
            <p>대표자: 김창훈</p>
          </section>
        </div>
      </div>
    </div>
  );
}
