import type { Entry, Stats, MonthStat, MoMChange } from "../types";
import { MONTHS, CURRENT_YEAR, CURRENT_MONTH, PROFIT_RATE } from "../constants";

export function computeStats(entries: Entry[], year: number): Stats {
  const yearEntries = entries.filter((e) => yearOf(e.date) === year);
  const months: MonthStat[] = MONTHS.map((_, i) => {
    const list = yearEntries.filter((e) => e.m === i);
    const total = list.reduce((s, e) => s + e.amount, 0);
    const count = list.length;
    const profit = total * PROFIT_RATE;
    const days = new Set(list.map((e) => e.date)).size;
    return {
      total,
      profit,
      count,
      days,
      avgAmount: count ? total / count : 0,
      avgProfit: count ? profit / count : 0,
      avgProfitPerDay: days ? profit / days : 0,
    };
  });
  const total = months.reduce((s, m) => s + m.total, 0);
  const count = months.reduce((s, m) => s + m.count, 0);
  const days = new Set(yearEntries.map((e) => e.date)).size;
  const profit = total * PROFIT_RATE;
  return {
    months,
    year: { total, profit, count, days, avgProfitPerDay: days ? profit / days : 0 },
  };
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

export function dayStat(
  entries: Entry[],
  today: string,
  sparkDays = 14,
): { total: number; prev: number; prevDate: string | null; change: MoMChange; series: number[] } {
  const byDate = new Map<string, number>();
  entries.forEach((e) => byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount));
  const total = byDate.get(today) ?? 0;
  const prevDates = Array.from(byDate.keys()).filter((d) => d < today).sort();
  const prevDate = prevDates.length ? prevDates[prevDates.length - 1] : null;
  const prev = prevDate ? byDate.get(prevDate) ?? 0 : 0;
  const change: MoMChange = prev ? { pct: ((total - prev) / prev) * 100, up: total >= prev } : null;
  const series: number[] = [];
  const base = new Date(today + "T00:00:00");
  for (let i = sparkDays - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    series.push(byDate.get(iso) ?? 0);
  }
  return { total, prev, prevDate, change, series };
}

// Porovnání vybraného měsíce s předchozím měsícem (v rámci roku).
export function monthChange(months: MonthStat[], mi: number, sel: (m: MonthStat) => number): MoMChange {
  const prev = mi > 0 ? months[mi - 1] : undefined;
  if (!prev || prev.count === 0) return null;
  const cur = sel(months[mi]);
  const prevV = sel(prev);
  if (!prevV) return null;
  return { pct: ((cur - prevV) / prevV) * 100, up: cur >= prevV };
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
