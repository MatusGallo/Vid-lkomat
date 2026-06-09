import { useRef, useState } from "react";
import type { Entry, MonthStat } from "../types";
import { MONTHS, CURRENT_MONTH, CURRENT_YEAR, PROFIT_RATE, PROFIT_PCT } from "../constants";
import { czk, dateLabel, groupAmount, parseAmount, todayISO } from "../utils/format";
import { useSettings } from "../utils/SettingsContext";
import { useRowEdit } from "../hooks/useRowEdit";
import { Truck, Plus } from "../icons";
import { Kpi } from "./Kpi";
import { AmountInput, DateInput, RowActions } from "./RowActions";

type Props = {
  m: number;
  entries: Entry[];
  monthStat: MonthStat;
  onAdd: (m: number, date: string, amount: number) => void;
  onEdit: (id: string, amount: number, date?: string) => void;
  onRequestDelete: (entry: Entry) => void;
};

export function MonthView({ m, entries, monthStat, onAdd, onEdit, onRequestDelete }: Props) {
  const { settings } = useSettings();
  const year = settings.selectedYear;
  const isCurrent = CURRENT_MONTH === m && CURRENT_YEAR === year;
  const defaultDate = isCurrent
    ? todayISO()
    : year + "-" + String(m + 1).padStart(2, "0") + "-01";
  const [date, setDate] = useState(defaultDate);
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const ed = useRowEdit(onEdit);
  const sorted = entries
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const previewAmount = parseAmount(amount);

  const submit = () => {
    const v = parseAmount(amount);
    if (v === null || v <= 0) {
      setErr("Zadej platnou částku větší než 0.");
      return;
    }
    onAdd(m, date, v);
    setAmount("");
    setErr("");
    if (ref.current) ref.current.focus();
  };

  return (
    <div className="od-fade">
      <div className="od-head">
        <h1>{MONTHS[m]} {year}</h1>
      </div>

      <div className="od-kpis">
        <Kpi
          label="Celková částka"
          value={czk(monthStat.total)}
          series={sorted.map((e) => e.amount)}
          foot={"Ø " + czk(monthStat.avgAmount) + " / zásah"}
        />
        <Kpi
          label={`Čistý zisk ${PROFIT_PCT} %`}
          value={czk(monthStat.profit)}
          series={sorted.map((e) => e.amount * PROFIT_RATE)}
          accent
          foot={"Ø " + czk(monthStat.avgProfit) + " / zásah"}
        />
        <Kpi
          label="Počet zásahů"
          value={String(monthStat.count)}
          unit="zásahů"
          series={sorted.map((e) => e.amount)}
          foot={MONTHS[m] + " " + year}
        />
      </div>

      <section className="od-panel">
        <div className="od-panel-head"><div className="od-panel-title">Nový zásah</div></div>
        <div className="od-form">
          <div className="od-field">
            <label>Datum</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="od-field grow">
            <label>Celková částka (Kč)</label>
            <input
              ref={ref}
              type="text"
              inputMode="decimal"
              placeholder="např. 3 500"
              value={amount}
              onChange={(e) => setAmount(groupAmount(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="od-field">
            <label>Zisk {PROFIT_PCT} %</label>
            <div className="od-preview mono">
              {previewAmount ? czk(previewAmount * PROFIT_RATE) : "–"}
            </div>
          </div>
          <button className="od-add" onClick={submit}>
            <Plus size={16} /> Přidat
          </button>
        </div>
        {err && <p className="od-err">{err}</p>}
      </section>

      <section className="od-panel">
        <div className="od-panel-head">
          <div className="od-panel-title">Záznamy · {monthStat.count} zásahů</div>
        </div>
        {sorted.length === 0 ? (
          <div className="od-empty">
            <Truck size={34} /> Zatím žádné zásahy v měsíci {MONTHS[m].toLowerCase()}.
          </div>
        ) : (
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>DATUM</th>
                  <th className="r">ČÁSTKA</th>
                  <th className="r">ZISK {PROFIT_PCT} %</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e, i) => {
                  const editing = ed.editId === e.id;
                  const prev = editing ? parseAmount(ed.editVal) || 0 : e.amount;
                  return (
                    <tr key={e.id}>
                      <td className="faint mono">{i + 1}</td>
                      <td className="mono">
                        {editing ? <DateInput ed={ed} /> : dateLabel(e.date)}
                      </td>
                      <td className="r mono strong">
                        {editing ? <AmountInput ed={ed} /> : czk(e.amount)}
                      </td>
                      <td className="r mono profit">{czk(prev * PROFIT_RATE)}</td>
                      <td className="r">
                        <RowActions e={e} ed={ed} onRequestDelete={onRequestDelete} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Celkem</td>
                  <td className="r mono strong">{czk(monthStat.total)}</td>
                  <td className="r mono profit">{czk(monthStat.profit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
