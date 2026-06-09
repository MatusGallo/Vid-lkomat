import type { Stats, View } from "../types";
import { MONTHS, CURRENT_MONTH, CURRENT_YEAR } from "../constants";
import { useSettings } from "../utils/SettingsContext";
import { Truck, X, LayoutDashboard, CalendarDays, Plus, LogOut } from "../icons";
import { logout } from "./PasswordGate";

type Props = {
  view: View;
  go: (v: View) => void;
  stats: Stats;
  open: boolean;
  onClose: () => void;
  years: number[];
  activeMonths: number[];
  onQuickAdd: () => void;
};

export function Sidebar({
  view, go, stats, open, onClose,
  years, activeMonths, onQuickAdd,
}: Props) {
  const { settings, setSelectedYear } = useSettings();

  return (
    <aside className={"od-side" + (open ? " is-open" : "")}>
      <div className="od-brand">
        <Truck size={22} className="od-brand-ico" />
        <span className="od-brand-name">Vydělkomat</span>
        <button className="od-side-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <button className="od-quick-btn" onClick={onQuickAdd} title="Rychlý zápis (N)">
        <Plus size={16} /> Rychlý zápis <span className="od-kbd">N</span>
      </button>

      <nav className="od-nav">
        <div className="od-nav-label">
          <span>Přehled</span>
          <select
            className="od-year-sel"
            value={settings.selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          className={"od-nav-item" + (view === "dashboard" ? " is-active" : "")}
          onClick={() => go("dashboard")}
        >
          <LayoutDashboard size={18} /> <span>Souhrn {settings.selectedYear}</span>
        </button>
        <div className="od-nav-label">Měsíce</div>
        {activeMonths.map((i) => {
          const c = stats.months[i].count;
          return (
            <button
              key={i}
              className={"od-nav-item" + (view === i ? " is-active" : "")}
              onClick={() => go(i)}
            >
              <CalendarDays size={18} /> <span>{MONTHS[i]}</span>
              {c > 0 && <span className="od-nav-badge">{c}</span>}
              {i === CURRENT_MONTH && settings.selectedYear === CURRENT_YEAR && (
                <span className="od-nav-dot" title="Aktuální měsíc" />
              )}
            </button>
          );
        })}
      </nav>

      <button className="od-logout" onClick={logout} title="Odhlásit se">
        <LogOut size={16} /> <span>Odhlásit</span>
      </button>
    </aside>
  );
}
