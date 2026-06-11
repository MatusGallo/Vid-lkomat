import type { Entry, Stats, MonthStat, MoMChange } from "../types";
import { CURRENT_YEAR, CURRENT_MONTH, PROFIT_RATE } from "../constants";

// Výplatní období zápisu: den ≥ 21 patří už do následujícího měsíce.
// Vrací { y, m } – rok a 0-based index měsíce, podle kterého se zápis počítá.
export function periodOf(iso: string): { y: number; m: number } {
  const y = parseInt(iso.slice(0, 4), 10);
  const mo = parseInt(iso.slice(5, 7), 10) - 1;
  const d = parseInt(iso.slice(8, 10), 10);
  if (d >= 21) {
    const nm = mo + 1;
    return nm > 11 ? { y: y + 1, m: 0 } : { y, m: nm };
  }
  return { y, m: mo };
}

export function computeStats(entries: Entry[], year: number): Stats {
  // Jeden průchod: každý zápis roztřídíme do měsíce svého výplatního období.
  const buckets: Entry[][] = Array.from({ length: 12 }, () => []);
  for (const e of entries) {
    const p = periodOf(e.date);
    if (p.y === year) buckets[p.m].push(e);
  }
  const months: MonthStat[] = buckets.map((list) => {
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
  const days = new Set(buckets.flatMap((list) => list.map((e) => e.date))).size;
  const profit = total * PROFIT_RATE;
  return {
    months,
    year: { total, profit, count, days, avgProfitPerDay: days ? profit / days : 0 },
  };
}

export function availableYears(entries: Entry[]): number[] {
  const set = new Set<number>();
  entries.forEach((e) => set.add(periodOf(e.date).y));
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

export function niceCeil(n: number): number {
  if (n <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / mag;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * mag;
}
