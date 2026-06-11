import { useEffect, useMemo, useState } from "react";
import type { Entry, View } from "./types";
import { loadEntries, saveEntries } from "./utils/storage";
import { apiList, apiUpsert, apiDelete } from "./utils/api";
import { activeMonthsOf, availableYears, computeStats, periodOf } from "./utils/stats";
import { CURRENT_MONTH, CURRENT_YEAR } from "./constants";
import { uid } from "./utils/format";
import { useSettings } from "./utils/SettingsContext";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MonthView } from "./components/MonthView";
import { ConfirmModal } from "./components/ConfirmModal";
import { QuickAddModal } from "./components/QuickAddModal";
import { Logo, Menu, Plus } from "./icons";

export default function App() {
  const { settings, setSelectedYear } = useSettings();
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [view, setView] = useState<View>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  // Aktualizuj UI + lokální cache okamžitě (optimistic update).
  const cache = (next: Entry[]) => {
    setEntries(next);
    saveEntries(next);
  };

  // Při startu sesynchronizuj s serverem. Lokální záznamy, které na serveru
  // chybí (první migrace z localStorage nebo offline úpravy), nahraj nahoru;
  // u konfliktů podle id vítězí server. Offline → ponecháme lokální cache.
  useEffect(() => {
    apiList()
      .then(async (server) => {
        const serverIds = new Set(server.map((e) => e.id));
        const localOnly = loadEntries().filter((e) => !serverIds.has(e.id));
        await Promise.all(localOnly.map((e) => apiUpsert(e).catch(() => {})));
        cache(server.concat(localOnly));
      })
      .catch(() => {
        /* offline / chyba serveru: pokračujeme s lokální cache */
      });
  }, []);

  const addEntry = (m: number, date: string, amount: number) => {
    const e: Entry = { id: uid(), m, date, amount };
    cache(entries.concat([e]));
    apiUpsert(e).catch(() => {});
  };
  const removeEntry = (id: string) => {
    cache(entries.filter((e) => e.id !== id));
    apiDelete(id).catch(() => {});
  };
  const updateEntry = (id: string, amount: number, date?: string) => {
    let updated: Entry | undefined;
    const next = entries.map((e) => {
      if (e.id !== id) return e;
      updated =
        date && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? { ...e, amount, date, m: parseInt(date.slice(5, 7), 10) - 1 }
          : { ...e, amount };
      return updated;
    });
    cache(next);
    if (updated) apiUpsert(updated).catch(() => {});
  };

  const stats = useMemo(
    () => computeStats(entries, settings.selectedYear),
    [entries, settings.selectedYear],
  );
  const years = useMemo(() => availableYears(entries), [entries]);
  const activeMonths = useMemo(
    () => activeMonthsOf(stats.months, settings.selectedYear),
    [stats.months, settings.selectedYear],
  );
  // Souhrn měsíců pro každý rok zvlášť – sidebar je zobrazuje jako rozbalovací sekce.
  // U aktuálního roku doplníme i zbývající měsíce do konce roku (i bez záznamů).
  const yearGroups = useMemo(
    () =>
      years.map((y) => {
        const s = computeStats(entries, y);
        const months = new Set(activeMonthsOf(s.months, y));
        if (y === CURRENT_YEAR) {
          for (let i = CURRENT_MONTH; i <= 11; i++) months.add(i);
        }
        return {
          year: y,
          months: s.months,
          activeMonths: Array.from(months).sort((a, b) => a - b),
        };
      }),
    [entries, years],
  );

  useEffect(() => {
    // Měsíce do konce aktuálního roku jsou navigovatelné i bez záznamů (viz sidebar).
    const isFutureCurrentYear =
      settings.selectedYear === CURRENT_YEAR && typeof view === "number" && view >= CURRENT_MONTH;
    if (typeof view === "number" && !activeMonths.includes(view) && !isFutureCurrentYear) {
      setView("dashboard");
    }
  }, [activeMonths, view, settings.selectedYear]);

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

  const go = (v: View, year?: number) => {
    if (year !== undefined && year !== settings.selectedYear) setSelectedYear(year);
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
          <Logo size={24} /> Vydělkomat
        </div>
      </div>

      <div className="od-shell">
        {navOpen && <div className="od-backdrop" onClick={() => setNavOpen(false)} />}
        <Sidebar
          view={view}
          go={go}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          yearGroups={yearGroups}
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
              entries={entries.filter((e) => {
                const p = periodOf(e.date);
                return p.m === view && p.y === settings.selectedYear;
              })}
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
        onAdd={addEntry}
      />

      <button
        className="od-fab-menu"
        onClick={() => setNavOpen(true)}
        aria-label="Otevřít menu"
        title="Menu"
      >
        <Menu size={22} />
      </button>

      <button
        className="od-fab"
        onClick={() => setQuickOpen(true)}
        aria-label="Přidat zásah"
        title="Přidat zásah"
      >
        <Plus size={20} /> <span>Přidat zásah</span>
      </button>
    </div>
  );
}
