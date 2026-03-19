// 날짜 기반으로 매일 바뀌는 콘텐츠

const QUOTES = [
  { text: '작은 가게도 숫자를 알면 큰 가게가 됩니다.', author: '경영의 기본' },
  { text: '매출이 답이 아닙니다. 남는 게 답입니다.', author: '소상공인의 지혜' },
  { text: '오늘 하루도 가게 문을 여는 당신이 대단합니다.', author: '사장님 응원단' },
  { text: '1%의 원가 절감이 10%의 매출 증가보다 쉽습니다.', author: '경영 격언' },
  { text: '혼자 고민하지 마세요. 전문가가 있습니다.', author: '함께하는 경영' },
  { text: '숫자를 기록하는 순간, 경영이 시작됩니다.', author: '기록의 힘' },
  { text: '쉬는 것도 경영입니다. 오늘 좀 쉬셔도 됩니다.', author: '사장님 건강학' },
  { text: '단골 한 명이 신규 열 명보다 낫습니다.', author: '장사의 정석' },
  { text: '세금을 아는 만큼 돈이 남습니다.', author: '절세의 기술' },
  { text: '어제보다 1만원 더 남겼다면 성공한 하루입니다.', author: '작은 성공' },
  { text: '사장님의 시간도 돈입니다. 시급을 꼭 계산하세요.', author: '시간 경영' },
  { text: '비수기는 준비하는 시간입니다. 성수기가 옵니다.', author: '계절 경영' },
  { text: '카드 수수료, 배달 수수료, 다 원가입니다.', author: '숨은 비용 관리' },
  { text: '메뉴 하나를 줄이면 원가가 보입니다.', author: '선택과 집중' },
  { text: '오늘도 출근한 사장님, 이미 절반은 성공입니다.', author: '사장님 응원단' },
  { text: '적자가 두렵다면 숫자부터 들여다보세요.', author: '위기 관리' },
  { text: '좋은 직원 한 명이 매출을 바꿉니다.', author: '인재 경영' },
  { text: '가격을 올리는 건 용기, 원가를 낮추는 건 지혜입니다.', author: '가격의 심리학' },
  { text: '월말 정산을 두려워하지 마세요. 알아야 바꿀 수 있습니다.', author: '숫자의 용기' },
  { text: '당신의 가게는 누군가에게 꼭 필요한 곳입니다.', author: '존재의 가치' },
  { text: '지출을 줄이는 것보다 불필요한 지출을 찾는 게 먼저입니다.', author: '경비 정리' },
  { text: '매출 목표보다 이익 목표를 세우세요.', author: '이익 중심 경영' },
  { text: '한 달에 한 번, 숫자를 정리하면 한 해가 편합니다.', author: '월말 습관' },
  { text: '잘 쉬어야 잘 일합니다. 사장님도 사람입니다.', author: '워라밸' },
  { text: '손님의 "또 올게요"가 최고의 매출 지표입니다.', author: '고객 만족' },
  { text: '경쟁자를 보지 말고 내 숫자를 보세요.', author: '나만의 경영' },
  { text: '부가세 신고 전에 미리 적립하면 마음이 편합니다.', author: '세금 준비' },
  { text: '매일 1%씩 나아지면 1년 후 37배가 됩니다.', author: '복리의 마법' },
  { text: '힘든 날도 있지만, 그래도 내 가게가 있잖아요.', author: '사장님 위로' },
  { text: '오늘의 기록이 내일의 전략이 됩니다.', author: '데이터 경영' },
  { text: '사장님, 오늘 하루도 수고 많으셨습니다.', author: '하루 마무리' },
];

const TIPS = [
  { title: '간이과세자 기준 변경', body: '연 매출 1억 400만원 미만이면 간이과세자로 전환 가능합니다. 부가세 부담이 크게 줄어요.' },
  { title: '카드 매출 수수료 확인', body: '연 매출 3억 이하 가맹점은 카드 수수료 우대(0.5~1.5%)를 받을 수 있습니다.' },
  { title: '소상공인 정책자금', body: '소상공인시장진흥공단에서 저금리 정책자금을 신청할 수 있습니다. 분기별 접수일을 확인하세요.' },
  { title: '인건비 절세 팁', body: '직원 급여를 계좌이체로 지급하고 원천세를 신고하면 비용 인정받아 소득세가 줄어듭니다.' },
  { title: '간편장부 활용', body: '연 매출 7,500만원 미만이면 간편장부 대상자입니다. 복식부기보다 훨씬 쉬워요.' },
  { title: '음식점 의제매입세액공제', body: '음식점은 농산물 매입액의 일정 비율을 부가세에서 공제받을 수 있습니다.' },
  { title: '4대보험 두루누리', body: '월급 260만원 미만 직원이 있으면 두루누리 사업으로 보험료 80%를 지원받을 수 있습니다.' },
  { title: '노란우산공제', body: '소기업 사업주 퇴직금 제도입니다. 연 최대 500만원 소득공제 혜택이 있어요.' },
  { title: '임대료 부담 줄이기', body: '매출 대비 임대료가 15% 이상이면 위험 신호입니다. 재계약 시 협상 카드를 준비하세요.' },
  { title: '배달앱 수수료 관리', body: '배달앱 수수료는 매출의 15~25%입니다. 자체 배달이나 포장 유도로 수수료를 줄여보세요.' },
  { title: '폐업도 전략이다', body: '적자가 6개월 이상 지속되면 전문가 상담을 받으세요. 빠른 판단이 손실을 줄입니다.' },
  { title: '현금영수증 발행', body: '현금영수증을 발행하면 부가세 신고 시 매입세액 공제에 도움이 됩니다.' },
  { title: '사업용 신용카드 등록', body: '홈택스에 사업용 신용카드를 등록하면 매입세액 공제가 자동 처리됩니다.' },
  { title: '전기료 절감', body: '한전 소상공인 전기료 특별 지원 사업을 확인하세요. 최대 20만원 감면 가능합니다.' },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodayQuote() {
  const day = getDayOfYear();
  return QUOTES[day % QUOTES.length];
}

export function getTodayTip() {
  const day = getDayOfYear();
  return TIPS[day % TIPS.length];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '새벽에도 일하시는 사장님';
  if (hour < 10) return '좋은 아침입니다, 사장님';
  if (hour < 12) return '오전도 힘내세요, 사장님';
  if (hour < 14) return '점심은 드셨나요, 사장님';
  if (hour < 18) return '오후도 파이팅, 사장님';
  if (hour < 22) return '오늘 하루 수고하셨습니다, 사장님';
  return '늦은 밤까지 고생 많으십니다, 사장님';
}

export function getTodayDate(): string {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
}
