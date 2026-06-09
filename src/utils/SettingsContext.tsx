import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Settings, loadSettings, saveSettings, DEFAULT_SETTINGS } from "./settings";

type Ctx = {
  settings: Settings;
  setSelectedYear: (year: number) => void;
  reset: () => void;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const persist = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);
  return (
    <SettingsCtx.Provider
      value={{
        settings,
        setSelectedYear: (year) => persist({ ...settings, selectedYear: year }),
        reset: () => persist(DEFAULT_SETTINGS),
      }}
    >
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
