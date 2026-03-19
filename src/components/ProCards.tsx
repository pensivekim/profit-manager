'use client';

interface Props {
  monthlyIncomeTax: number;
  empCount: number;
  finalProfit: number;
  onConsult?: (proType: string, proLabel: string) => void;
}

interface CardInfo {
  type: string;
  title: string;
  desc: string;
  urgent: boolean;
  reason: string;
  icon: string;
}

export default function ProCards({ monthlyIncomeTax, empCount, finalProfit, onConsult }: Props) {
  const cards: CardInfo[] = [
    {
      type: 'tax',
      title: '세무사',
      icon: '\uD83D\uDCCA',
      urgent: monthlyIncomeTax > 300000,
      reason: monthlyIncomeTax > 300000
        ? `월 종소세 ${Math.round(monthlyIncomeTax / 10000)}만원 - 절세 전략 필요`
        : '세금 최적화 상담',
      desc: '부가세 신고, 종합소득세 절세, 경비처리 최적화',
    },
    {
      type: 'labor',
      title: '노무사',
      icon: '\uD83D\uDC65',
      urgent: empCount > 0,
      reason: empCount > 0
        ? `직원 ${empCount}명 - 4대보험/근로계약 점검 필요`
        : '고용 계획 시 사전 상담 권장',
      desc: '근로계약서, 4대보험, 퇴직금, 노동법 준수',
    },
    {
      type: 'legal',
      title: '변호사',
      icon: '\u2696\uFE0F',
      urgent: finalProfit < 0,
      reason: finalProfit < 0
        ? '영업 적자 - 임대차/계약 검토 필요'
        : '계약서 검토, 분쟁 예방',
      desc: '임대차 재협상, 프랜차이즈 계약, 채권 회수',
    },
  ];

  return (
    <div className="rounded-2xl p-6 shadow-sm border border-[#e0d5c5]" style={{ background: '#FFFDF7' }}>
      <h3 className="font-bold text-gray-800 mb-4">전문가 상담 연결</h3>
      <div className="space-y-3">
        {cards.map((c) => (
          <div
            key={c.type}
            className={`rounded-xl p-4 border-2 transition-all ${
              c.urgent
                ? 'border-red-300 bg-red-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{c.title}</span>
                  {c.urgent && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      긴급 권장
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                <p className={`text-xs mt-2 ${c.urgent ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                  {c.reason}
                </p>
                {onConsult && (
                  <button
                    onClick={() => onConsult(c.type, c.title)}
                    className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      c.urgent
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {c.title} 상담 신청
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
