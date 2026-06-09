import { useEffect, useMemo, useState } from "react";
import type { Entry, View } from "./types";
import { loadEntries, saveEntries } from "./utils/storage";
import { activeMonthsOf, availableYears, computeStats } from "./utils/stats";
import { uid } from "./utils/format";
import { useSettings } from "./utils/SettingsContext";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MonthView } from "./components/MonthView";
import { ConfirmModal } from "./components/ConfirmModal";
import { QuickAddModal } from "./components/QuickAddModal";
import { Truck, Menu } from "./icons";

export default function App() {
  const { settings } = useSettings();
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [view, setView] = useState<View>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const persist = (next: Entry[]) => {
    setEntries(next);
    saveEntries(next);
  };
  const addEntry = (m: number, date: string, amount: number) =>
    persist(entries.concat([{ id: uid(), m, date, amount }]));
  const removeEntry = (id: string) => persist(entries.filter((e) => e.id !== id));
  const updateEntry = (id: string, amount: number, date?: string) =>
    persist(
      entries.map((e) => {
        if (e.id !== id) return e;
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return { ...e, amount, date, m: parseInt(date.slice(5, 7), 10) - 1 };
        }
        return { ...e, amount };
      }),
    );

  const stats = useMemo(
    () => computeStats(entries, settings.selectedYear),
    [entries, settings.selectedYear],
  );
  const years = useMemo(() => availableYears(entries), [entries]);
  const activeMonths = useMemo(
    () => activeMonthsOf(stats.months, settings.selectedYear),
    [stats.months, settings.selectedYear],
  );

  useEffect(() => {
    if (typeof view === "number" && !activeMonths.includes(view)) {
      setView("dashboard");
    }
  }, [activeMonths, view]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
        e.preventDefault();
        setQuickOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setQuickOpen(true);
      }
      if (e.key === "Escape") setQuickOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const go = (v: View) => {
    setView(v);
    setNavOpen(false);
  };

  return (
    <div className="od-app">
      <div className="od-topbar">
        <button className="od-burger" onClick={() => setNavOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="od-topbar-brand">
          <Truck size={18} /> Vydělkomat
        </div>
      </div>

      <div className="od-shell">
        {navOpen && <div className="od-backdrop" onClick={() => setNavOpen(false)} />}
        <Sidebar
          view={view}
          go={go}
          stats={stats}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          years={years}
          activeMonths={activeMonths}
          onQuickAdd={() => setQuickOpen(true)}
        />
        <main className="od-main">
          {view === "dashboard" ? (
            <Dashboard
              stats={stats}
              entries={entries}
              activeMonths={activeMonths}
              onEdit={updateEntry}
              onRequestDelete={setPendingDelete}
            />
          ) : (
            <MonthView
              m={view}
              entries={entries.filter(
                (e) =>
                  e.m === view &&
                  parseInt(e.date.slice(0, 4), 10) === settings.selectedYear,
              )}
              monthStat={stats.months[view]}
              onAdd={addEntry}
              onEdit={updateEntry}
              onRequestDelete={setPendingDelete}
            />
          )}
        </main>
      </div>

      <ConfirmModal
        entry={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeEntry(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />

      <QuickAddModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        onAdd={(m, date, amount) => {
          addEntry(m, date, amount);
          setQuickOpen(false);
        }}
      />
    </div>
  );
}
