export const BENCHMARKS = {
  beauty:      { rent:18, labor:28, material:18, other:7,  name:"미용실/뷰티",          vatRate:0.025 },
  restaurant:  { rent:12, labor:25, material:32, other:6,  name:"식당/카페",            vatRate:0.04  },
  retail:      { rent:15, labor:20, material:42, other:5,  name:"소매/편의점",          vatRate:0.04  },
  manufacture: { rent:10, labor:30, material:28, other:8,  name:"제조/공방",            vatRate:0.02  },
  service:     { rent:16, labor:22, material:10, other:7,  name:"서비스/학원/세탁",      vatRate:0.03  },
  delivery:    { rent:0,  labor:0,  material:5,  other:35, name:"배달/퀵/대리운전",      vatRate:0.04  },
  freelance:   { rent:5,  labor:0,  material:5,  other:15, name:"프리랜서/1인사업",      vatRate:0.03  },
  directsales: { rent:0,  labor:0,  material:55, other:10, name:"방문판매/네트워크마케팅", vatRate:0.04  },
  gig:         { rent:0,  labor:0,  material:3,  other:25, name:"특수고용/플랫폼노동",    vatRate:0.03  },
} as const;

export type BizType = keyof typeof BENCHMARKS;

export const TAX_BRACKETS = [
  { limit: 14000000,   rate: 0.06, deduction: 0         },
  { limit: 50000000,   rate: 0.15, deduction: 1080000   },
  { limit: 88000000,   rate: 0.24, deduction: 5220000   },
  { limit: 150000000,  rate: 0.35, deduction: 14900000  },
  { limit: 300000000,  rate: 0.38, deduction: 19400000  },
  { limit: 500000000,  rate: 0.40, deduction: 25400000  },
  { limit: 1000000000, rate: 0.42, deduction: 35400000  },
  { limit: Infinity,   rate: 0.45, deduction: 65400000  },
];
