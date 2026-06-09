import type { MoMChange } from "../types";
import { ArrowUpRight, ArrowDownRight } from "../icons";
import { num1 } from "../utils/format";

type Props = {
  label: string;
  value: string;
  unit?: string;
  series?: number[];
  nowIndex?: number;
  change?: MoMChange;
  changeLabel?: string;
  accent?: boolean;
  foot?: string;
  extraFoot?: string;
};

export function Kpi({ label, value, unit, series = [], nowIndex, change, changeLabel = "vs. minulý měsíc", accent, foot, extraFoot }: Props) {
  const max = Math.max(...series, 1);
  const highlight = nowIndex ?? series.length - 1;
  return (
    <div className={"od-kpi" + (accent ? " is-accent" : "")}>
      <div className="od-kpi-top">
        <span className="od-kpi-label">{label}</span>
        {series.length > 0 && (
          <div className="od-spark">
            {series.map((v, i) => (
              <span
                key={i}
                className={"od-spark-bar" + (i === highlight ? " now" : "")}
                style={{ height: Math.max(8, (v / max) * 100) + "%" }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="od-kpi-val mono">
        {value} {unit && <em>{unit}</em>}
      </div>
      <div className="od-kpi-foot">
        {foot ? (
          <span className="flat">{foot}</span>
        ) : change ? (
          <span className={change.up ? "up" : "down"}>
            {change.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{" "}
            {num1(Math.abs(change.pct))} % <em>{changeLabel}</em>
          </span>
        ) : (
          <span className="flat">
            <ArrowUpRight size={14} /> <em>málo dat pro srovnání</em>
          </span>
        )}
        {extraFoot && <div className="od-kpi-extra mono">{extraFoot}</div>}
      </div>
    </div>
  );
}
