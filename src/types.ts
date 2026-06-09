export type Entry = {
  id: string;
  m: number;
  date: string;
  amount: number;
};

export type MonthStat = {
  total: number;
  profit: number;
  count: number;
  days: number;
  avgAmount: number;
  avgProfit: number;
  avgProfitPerDay: number;
};

export type YearStat = {
  total: number;
  profit: number;
  count: number;
  days: number;
  avgProfitPerDay: number;
};

export type Stats = {
  months: MonthStat[];
  year: YearStat;
};

export type View = "dashboard" | number;

export type MoMChange = { pct: number; up: boolean } | null;

export type TrendMode = "days" | "months" | "years";

export type TrendPoint = {
  label: string;
  fullLabel: string;
  total: number;
  profit: number;
  count: number;
  isCurrent?: boolean;
};
