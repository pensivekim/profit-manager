'use client';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: '경영현황', icon: '\uD83D\uDCCA' },
  { id: 'tax', label: '세금내역', icon: '\uD83D\uDCB0' },
  { id: 'ai', label: 'AI조언', icon: '\uD83E\uDD16' },
  { id: 'pro', label: '전문가연결', icon: '\uD83D\uDC64' },
];

export default function TabNav({ activeTab, onTabChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:static sm:border-t-0 sm:bg-transparent sm:mb-4">
      <div className="max-w-lg mx-auto flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors sm:rounded-xl sm:py-2.5 ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50 sm:bg-blue-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
