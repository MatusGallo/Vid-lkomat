import { useMemo, useState } from "react";
import type { Entry, Stats, TrendMode, TrendPoint } from "../types";
import { MONTHS, MONTHS_SHORT, CURRENT_MONTH, CURRENT_YEAR, PROFIT_RATE, PROFIT_PCT } from "../constants";
import { czk, dateLabel, parseAmount, todayISO } from "../utils/format";
import { dayStat, mom, yearOf } from "../utils/stats";
import { useSettings } from "../utils/SettingsContext";
import { useRowEdit } from "../hooks/useRowEdit";
import { Truck, BadgeCheck } from "../icons";
import { Kpi } from "./Kpi";
import { LineTrend } from "./LineTrend";
import { SummaryTable } from "./SummaryTable";
import { AmountInput, DateInput, RowActions } from "./RowActions";

type Props = {
  stats: Stats;
  entries: Entry[];
  activeMonths: number[];
  onEdit: (id: string, amount: number, date?: string) => void;
  onRequestDelete: (entry: Entry) => void;
};

export function Dashboard({ stats, entries, activeMonths, onEdit, onRequestDelete }: Props) {
  const { settings } = useSettings();
  const year = stats.year;
  const months = stats.months;
  const shown = activeMonths.map((i) => months[i]);
  const active = shown.filter((m) => m.count > 0).length;
  const ed = useRowEdit(onEdit);
  const yearEntries = entries.filter((e) => yearOf(e.date) === settings.selectedYear);
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const sorted = yearEntries
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    if (!filter.trim()) return sorted;
    const q = filter.trim().toLowerCase();
    return sorted.filter((e) => {
      const amount = String(Math.round(e.amount));
      const month = MONTHS[e.m].toLowerCase();
      const day = dateLabel(e.date).toLowerCase();
      return (
        e.date.includes(q) ||
        amount.includes(q) ||
        month.includes(q) ||
        day.includes(q)
      );
    });
  }, [yearEntries, filter]);
  const visible = filtered.slice(0, 20);

  const day = useMemo(() => dayStat(entries, todayISO()), [entries]);

  const [trendMode, setTrendMode] = useState<TrendMode>("days");

  const trendPoints = useMemo<TrendPoint[]>(() => {
    if (trendMode === "months") {
      return activeMonths.map((i) => ({
        label: MONTHS_SHORT[i],
        fullLabel: `${MONTHS[i]} ${settings.selectedYear}`,
        total: months[i].total,
        profit: months[i].profit,
        count: months[i].count,
        isCurrent: i === CURRENT_MONTH && settings.selectedYear === CURRENT_YEAR,
      }));
    }
    if (trendMode === "days") {
      if (yearEntries.length === 0) return [];
      const byDate = new Map<string, { total: number; count: number }>();
      yearEntries.forEach((e) => {
        const cur = byDate.get(e.date) || { total: 0, count: 0 };
        cur.total += e.amount;
        cur.count += 1;
        byDate.set(e.date, cur);
      });
      const today = todayISO();
      const firstDate = yearEntries.reduce(
        (min, e) => (e.date < min ? e.date : min),
        yearEntries[0].date,
      );
      const endISO = settings.selectedYear === CURRENT_YEAR ? today : settings.selectedYear + "-12-31";
      const start = new Date(firstDate + "T00:00:00");
      const end = new Date(endISO + "T00:00:00");
      const points: TrendPoint[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        const v = byDate.get(iso) || { total: 0, count: 0 };
        points.push({
          label: dateLabel(iso),
          fullLabel: iso,
          total: v.total,
          profit: v.total * PROFIT_RATE,
          count: v.count,
          isCurrent: iso === today,
        });
      }
      return points;
    }
    const byYear = new Map<string, { total: number; count: number }>();
    entries.forEach((e) => {
      const y = e.date.slice(0, 4);
      const cur = byYear.get(y) || { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      byYear.set(y, cur);
    });
    const curY = String(CURRENT_YEAR);
    return Array.from(byYear.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([y, v]) => ({
        label: y,
        fullLabel: `Rok ${y}`,
        total: v.total,
        profit: v.total * PROFIT_RATE,
        count: v.count,
        isCurrent: y === curY,
      }));
  }, [trendMode, entries, yearEntries, months, activeMonths, settings.selectedYear]);

  const trendTotals = useMemo(() => {
    const total = trendPoints.reduce((s, p) => s + p.total, 0);
    return total;
  }, [trendPoints]);

  const hasTrendData = trendPoints.some((p) => p.count > 0);
  const trendTitle =
    trendMode === "days" ? `Vývoj po dnech${trendPoints.length ? ` · ${trendPoints.length} dní` : ""}`
    : trendMode === "years" ? "Vývoj po letech"
    : `Vývoj v roce ${settings.selectedYear}`;

  return (
    <div className="od-fade">
      <div className="od-head"><h1>Souhrn {settings.selectedYear}</h1></div>

      <div className="od-kpis">
        <Kpi
          label="Dnešní výdělek"
          value={czk(day.total)}
          series={day.series}
          change={day.total > 0 ? day.change : undefined}
          changeLabel="vs. předchozí den"
          foot={day.total === 0 ? "zatím dnes žádný zápis" : undefined}
        />
        <Kpi
          label="Celkový obrat"
          value={czk(year.total)}
          series={shown.map((m) => m.total)}
          change={mom(shown, (m) => m.total)}
        />
        <Kpi
          label={`Čistý zisk ${PROFIT_PCT} %`}
          value={czk(year.profit)}
          series={shown.map((m) => m.profit)}
          accent
          change={mom(shown, (m) => m.profit)}
          extraFoot={year.days ? `Ø ${czk(year.avgProfitPerDay)} / den (${year.days} dní)` : undefined}
        />
        <Kpi
          label="Počet zásahů"
          value={String(year.count)}
          unit="zásahů"
          series={shown.map((m) => m.count)}
          change={mom(shown, (m) => m.count)}
        />
      </div>

      <section className="od-panel">
        <div className="od-panel-head">
          <div className="od-panel-title">
            {trendTitle} <span className="od-panel-total">{czk(trendTotals)}</span>
          </div>
          <div className="od-panel-tools">
            <div className="od-switch" role="tablist" aria-label="Režim grafu">
              {(["days", "months", "years"] as TrendMode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={trendMode === m}
                  className={"od-switch-btn" + (trendMode === m ? " is-active" : "")}
                  onClick={() => setTrendMode(m)}
                >
                  {m === "days" ? "Dny" : m === "months" ? "Měsíce" : "Roky"}
                </button>
              ))}
            </div>
            <div className="od-legend">
              <span className="od-leg"><span className="dot o" /> Obrat</span>
              <span className="od-leg"><span className="dot n" /> Zisk {PROFIT_PCT} %</span>
            </div>
          </div>
        </div>
        {hasTrendData ? (
          <LineTrend points={trendPoints} />
        ) : (
          <div className="od-empty">
            <Truck size={34} /> Zatím žádná data – přidej zásahy (stiskni <b>N</b>).
          </div>
        )}
      </section>

      <section className="od-panel">
        <div className="od-panel-head"><div className="od-panel-title">Roční souhrn</div></div>
        <SummaryTable shown={shown} year={year} active={active} activeMonths={activeMonths} />
        <p className="od-note">
          <b>ROK</b> = součet (u průměrů celkový průměr). <b>Ø měs.</b> = průměr z měsíců se záznamy ({active} z {activeMonths.length}).
        </p>
      </section>

      <section className="od-panel">
        <div className="od-panel-head">
          <div className="od-panel-title">Záznamy {settings.selectedYear} · {filtered.length}</div>
          <input
            type="search"
            className="od-search"
            placeholder="Hledat (datum, částka, měsíc)…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {visible.length === 0 ? (
          <div className="od-empty">
            <Truck size={34} /> {filter ? "Žádný záznam neodpovídá filtru." : "Zatím žádné zásahy. Stiskni N pro rychlý zápis."}
          </div>
        ) : (
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>DATUM</th>
                  <th>MĚSÍC</th>
                  <th className="r">ČÁSTKA</th>
                  <th className="r">ZISK {PROFIT_PCT} %</th>
                  <th>STAV</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => {
                  const editing = ed.editId === e.id;
                  const prev = editing ? parseAmount(ed.editVal) || 0 : e.amount;
                  const monthIdx = editing
                    ? parseInt(ed.editDate.slice(5, 7), 10) - 1
                    : e.m;
                  return (
                    <tr key={e.id}>
                      <td className="mono">
                        {editing ? <DateInput ed={ed} /> : dateLabel(e.date)}
                      </td>
                      <td>{MONTHS[Number.isFinite(monthIdx) ? monthIdx : e.m]}</td>
                      <td className="r mono strong">
                        {editing ? <AmountInput ed={ed} /> : czk(e.amount)}
                      </td>
                      <td className="r mono profit">{czk(prev * PROFIT_RATE)}</td>
                      <td>
                        <span className="od-badge">
                          <BadgeCheck size={13} /> Zapsáno
                        </span>
                      </td>
                      <td className="r">
                        <RowActions e={e} ed={ed} onRequestDelete={onRequestDelete} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > visible.length && (
          <p className="od-note">Zobrazeno {visible.length} z {filtered.length}. Zužte filtr pro nalezení dalších.</p>
        )}
      </section>
    </div>
  );
}
