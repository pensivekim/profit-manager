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

  const inputClass = "w-full rounded-lg border border-[#e0d5c5] bg-[#FFFDF7] px-4 py-3 text-[#3a3025] focus:border-[#2D5A8E] focus:ring-1 focus:ring-[#2D5A8E] outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: '#FFFDF7' }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-4">{"\u2705"}</p>
            <h3 className="font-bold text-[#3a3025] mb-2" style={{ fontSize: '20px', lineHeight: '1.8' }}>접수 완료</h3>
            <p className="text-[#5a4a3a] mb-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>
              {proLabel} 상담 신청이 접수되었습니다.
            </p>
            <p className="text-[#a09080] mb-6" style={{ fontSize: '16px', lineHeight: '1.8' }}>
              1영업일 내 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-[#2D5A8E] text-white font-bold"
              style={{ fontSize: '16px', minHeight: '48px' }}
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#3a3025]" style={{ fontSize: '18px', lineHeight: '1.8' }}>
                {proLabel} 상담 신청
              </h3>
              <button onClick={onClose} className="text-[#a09080] text-2xl leading-none p-2" style={{ minWidth: '48px', minHeight: '48px' }}>&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className={inputClass}
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className={inputClass}
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                  희망 상담 내용 <span className="font-normal text-[#a09080]">(선택)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="상담받고 싶은 내용을 간단히 적어주세요"
                  className={`${inputClass} resize-none`}
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1" style={{ minHeight: '48px' }}>
                <input
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  className="w-5 h-5 rounded border-[#c0b5a5] text-[#2D5A8E] focus:ring-[#2D5A8E]"
                />
                <div>
                  <span className="font-semibold text-[#5a4a3a]" style={{ fontSize: '16px' }}>내 경영 데이터 함께 전달</span>
                  <p className="text-[#a09080]" style={{ fontSize: '14px' }}>매출, 지출, 세금 계산 결과가 전문가에게 전달됩니다</p>
                </div>
              </label>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#2D5A8E] text-white font-bold hover:bg-[#24496f] transition-colors disabled:opacity-50"
                style={{ fontSize: '18px', minHeight: '48px', lineHeight: '1.8' }}
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
