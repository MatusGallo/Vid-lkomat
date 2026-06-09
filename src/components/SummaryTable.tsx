import type { MonthStat, YearStat } from "../types";
import { MONTHS_SHORT, CURRENT_MONTH, CURRENT_YEAR, PROFIT_PCT } from "../constants";
import { useSettings } from "../utils/SettingsContext";
import { czk, num1 } from "../utils/format";

type Props = {
  shown: MonthStat[];
  year: YearStat;
  active: number;
  activeMonths: number[];
};

type Row = {
  label: string;
  cell: (m: MonthStat) => string | number;
  yr: string | number;
  av: string | number;
  k: string;
};

export function SummaryTable({ shown, year, active, activeMonths }: Props) {
  const { settings } = useSettings();
  const avgM = (s: number) => (active ? s / active : 0);
  const avgOf = (sel: (m: MonthStat) => number): number => {
    const v = shown.filter((m) => m.count > 0).map(sel);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  const rows: Row[] = [
    { label: "Celková částka", cell: (m) => m.count ? czk(m.total) : "–", yr: czk(year.total), av: czk(avgM(year.total)), k: "strong" },
    { label: `Čistý zisk ${PROFIT_PCT} %`, cell: (m) => m.count ? czk(m.profit) : "–", yr: czk(year.profit), av: czk(avgM(year.profit)), k: "profit" },
    { label: "Počet zásahů", cell: (m) => m.count || "–", yr: year.count, av: num1(avgM(year.count)), k: "" },
    { label: "Pracovní dny", cell: (m) => m.days || "–", yr: year.days, av: num1(avgM(year.days)), k: "" },
    { label: "Ø částka / zásah", cell: (m) => m.count ? czk(m.avgAmount) : "–", yr: czk(year.count ? year.total / year.count : 0), av: czk(avgOf((m) => m.avgAmount)), k: "" },
    { label: "Ø zisk / zásah", cell: (m) => m.count ? czk(m.avgProfit) : "–", yr: czk(year.count ? year.profit / year.count : 0), av: czk(avgOf((m) => m.avgProfit)), k: "profit" },
    { label: "Ø zisk / den", cell: (m) => m.days ? czk(m.avgProfitPerDay) : "–", yr: czk(year.avgProfitPerDay), av: czk(avgOf((m) => m.avgProfitPerDay)), k: "profit" },
  ];
  const isCurYear = settings.selectedYear === CURRENT_YEAR;
  return (
    <div className="od-table-wrap">
      <table className="od-table od-summary">
        <thead>
          <tr>
            <th className="sticky">METRIKA</th>
            {activeMonths.map((i) => (
              <th key={i} className={"r" + (isCurYear && i === CURRENT_MONTH ? " is-cur" : "")}>
                {MONTHS_SHORT[i]}
              </th>
            ))}
            <th className="r yr">ROK</th>
            <th className="r av">Ø MĚS.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <th className="sticky rowhead">{row.label}</th>
              {shown.map((m, mi) => (
                <td key={mi} className={"r mono " + row.k + (m.count ? "" : " faint")}>
                  {row.cell(m)}
                </td>
              ))}
              <td className={"r mono yr " + row.k}>{row.yr}</td>
              <td className={"r mono av " + row.k}>{row.av}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
