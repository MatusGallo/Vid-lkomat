import type { Entry, Stats, MonthStat, MoMChange } from "../types";
import { MONTHS, CURRENT_YEAR, CURRENT_MONTH, PROFIT_RATE } from "../constants";

export function computeStats(entries: Entry[], year: number): Stats {
  const yearEntries = entries.filter((e) => yearOf(e.date) === year);
  const months: MonthStat[] = MONTHS.map((_, i) => {
    const list = yearEntries.filter((e) => e.m === i);
    const total = list.reduce((s, e) => s + e.amount, 0);
    const count = list.length;
    const profit = total * PROFIT_RATE;
    return {
      total,
      profit,
      count,
      avgAmount: count ? total / count : 0,
      avgProfit: count ? profit / count : 0,
    };
  });
  const total = months.reduce((s, m) => s + m.total, 0);
  const count = months.reduce((s, m) => s + m.count, 0);
  return { months, year: { total, profit: total * PROFIT_RATE, count } };
}

export function yearOf(iso: string): number {
  return parseInt(iso.slice(0, 4), 10);
}

export function availableYears(entries: Entry[]): number[] {
  const set = new Set<number>();
  entries.forEach((e) => set.add(yearOf(e.date)));
  set.add(CURRENT_YEAR);
  return Array.from(set).sort((a, b) => b - a);
}

export function activeMonthsOf(months: MonthStat[], year: number): number[] {
  const idx: number[] = [];
  months.forEach((m, i) => {
    if (m.count > 0) idx.push(i);
  });
  if (year === CURRENT_YEAR && !idx.includes(CURRENT_MONTH)) idx.push(CURRENT_MONTH);
  idx.sort((a, b) => a - b);
  return idx.length ? idx : [CURRENT_MONTH];
}

export function mom(shown: MonthStat[], sel: (m: MonthStat) => number): MoMChange {
  const wd = shown.filter((m) => m.count > 0);
  if (wd.length < 2) return null;
  const last = sel(wd[wd.length - 1]);
  const prev = sel(wd[wd.length - 2]);
  if (!prev) return null;
  return { pct: ((last - prev) / prev) * 100, up: last >= prev };
}

export function niceCeil(n: number): number {
  if (n <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / mag;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * mag;
}
