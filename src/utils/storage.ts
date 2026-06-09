import type { Entry } from "../types";
import { STORAGE_KEY } from "../constants";

export const loadEntries = (): Entry[] => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? (JSON.parse(v) as Entry[]) : [];
  } catch {
    return [];
  }
};

export const saveEntries = (a: Entry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    /* noop */
  }
};
