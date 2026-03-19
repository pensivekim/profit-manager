'use client';

import { useState } from 'react';

interface Props {
  proType: string;
  proLabel: string;
  recordSnapshot?: Record<string, unknown>;
  onClose: () => void;
}

export default function ConsultModal({ proType, proLabel, recordSnapshot, onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [shareData, setShareData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('이름과 전화번호를 입력해주세요');
      return;
    }
    if (!/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
      alert('올바른 전화번호를 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proType, name,
          phone: phone.replace(/-/g, ''),
          message,
          shareData,
          recordSnapshot: shareData ? recordSnapshot : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        alert(data.error || '접수에 실패했습니다');
      }
    } catch {
      alert('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-border px-4 py-3 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-4">{"\u2705"}</p>
            <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>접수 완료</h3>
            <p className="mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
              {proLabel} 상담 신청이 접수되었습니다.
            </p>
            <p className="mb-6" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
              1영업일 내 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl text-white font-bold"
              style={{ fontSize: 'var(--font-size-base)', minHeight: '48px', background: 'var(--accent)' }}
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
                {proLabel} 상담 신청
              </h3>
              <button onClick={onClose} className="text-2xl leading-none p-2" style={{ minWidth: '48px', minHeight: '48px', color: 'var(--text-hint)' }}>&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className={inputClass}
                  style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className={inputClass}
                  style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
                  희망 상담 내용 <span className="font-normal" style={{ color: 'var(--text-hint)' }}>(선택)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="상담받고 싶은 내용을 간단히 적어주세요"
                  className={`${inputClass} resize-none`}
                  style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1" style={{ minHeight: '48px' }}>
                <input
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  className="w-5 h-5 rounded border-border"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div>
                  <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>내 경영 데이터 함께 전달</span>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>매출, 지출, 세금 계산 결과가 전문가에게 전달됩니다</p>
                </div>
              </label>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
                style={{ fontSize: 'var(--font-size-lg)', minHeight: '48px', lineHeight: 'var(--line-height)', background: 'var(--accent)' }}
              >
                {loading ? '접수 중...' : '상담 신청하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
