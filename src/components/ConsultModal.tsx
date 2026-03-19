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
    setLoading(true);
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proType, name, phone, message,
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

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">{"\u2705"}</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">접수 완료</h3>
            <p className="text-sm text-gray-600 mb-1">
              {proLabel} 상담 신청이 접수되었습니다.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              카카오톡으로 확인 메시지가 발송됩니다.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {proLabel} 상담 신청
              </h3>
              <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">희망 상담 내용</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="상담받고 싶은 내용을 간단히 적어주세요"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">내 경영 데이터 함께 전달</span>
              </label>

              {shareData && (
                <p className="text-xs text-gray-400 -mt-2 ml-6">
                  매출, 지출, 세금 계산 결과가 전문가에게 전달됩니다
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
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
