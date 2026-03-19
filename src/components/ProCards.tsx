'use client';

import { fmtComma } from '@/lib/format';

interface Props {
  monthlyIncomeTax: number;
  vatProvision: number;
  empCount: number;
  insuranceCost: number;
  finalProfit: number;
  rentPct: number;
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

export default function ProCards({ monthlyIncomeTax, vatProvision, empCount, insuranceCost, finalProfit, rentPct, onConsult }: Props) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const vatDeadlineSoon = [1, 4, 7, 10].includes(month) || [12, 3, 6, 9].includes(month);

  const taxUrgent = monthlyIncomeTax > 200000 || vatDeadlineSoon;
  const laborUrgent = empCount > 0;
  const legalUrgent = finalProfit < 0 || rentPct > 30;

  const cards: CardInfo[] = [
    {
      type: 'tax',
      title: '세무사',
      icon: '\uD83D\uDCCA',
      urgent: taxUrgent,
      reason: monthlyIncomeTax > 200000
        ? `월 종소세 ${fmtComma(monthlyIncomeTax)}원 + 부가세 적립 ${fmtComma(vatProvision)}원 - 절세 전략 필요`
        : vatDeadlineSoon
          ? `부가세 신고 시즌입니다. 사전 준비가 절세의 시작입니다.`
          : '세금 최적화 상담으로 매달 절약할 수 있습니다',
      desc: '부가세 신고, 종합소득세 절세, 경비처리 최적화',
    },
    {
      type: 'labor',
      title: '노무사',
      icon: '\uD83D\uDC65',
      urgent: laborUrgent,
      reason: empCount > 0
        ? `직원 ${empCount}명, 4대보험 ${fmtComma(insuranceCost)}원/월 - 근로계약/보험 점검 필요`
        : '직원 채용 계획이 있다면 사전 상담을 권장합니다',
      desc: '근로계약서, 4대보험, 퇴직금, 노동법 준수',
    },
    {
      type: 'legal',
      title: '변호사',
      icon: '\u2696\uFE0F',
      urgent: legalUrgent,
      reason: finalProfit < 0
        ? `월 ${fmtComma(Math.abs(finalProfit))}원 적자 - 임대차/계약 재검토 필요`
        : rentPct > 30
          ? `임대료 비율 ${rentPct}% (위험 기준 30% 초과) - 재협상 검토`
          : '계약서 검토, 분쟁 예방 상담',
      desc: '임대차 재협상, 프랜차이즈 계약, 채권 회수',
    },
  ];

  return (
    <div className="rounded-2xl p-5 shadow-sm border border-[#e0d5c5]" style={{ background: 'var(--bg-card)' }}>
      <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
        {"\uD83D\uDC64"} 전문가 상담 연결
      </h3>
      <div className="space-y-3">
        {cards.map((c) => (
          <div
            key={c.type}
            className={`rounded-xl p-4 border-2 transition-all ${
              c.urgent ? 'border-red-300 bg-red-50' : 'border-[#e0d5c5]'
            }`}
            style={{ background: c.urgent ? undefined : 'var(--bg-card)' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{c.title}</span>
                  {c.urgent && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                      긴급 권장
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>{c.desc}</p>
                <p
                  className={`mt-1 ${c.urgent ? 'text-red-600 font-semibold' : ''}`}
                  style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: c.urgent ? undefined : 'var(--text-hint)' }}
                >
                  {c.reason}
                </p>
                {onConsult && (
                  <button
                    onClick={() => onConsult(c.type, c.title)}
                    className={`mt-3 w-full py-3 rounded-lg font-bold transition-colors ${
                      c.urgent
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'text-white hover:opacity-90'
                    }`}
                    style={{ fontSize: 'var(--font-size-base)', minHeight: '48px', lineHeight: 'var(--line-height)', background: c.urgent ? undefined : 'var(--accent)' }}
                  >
                    {c.title} 상담 신청하기
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
