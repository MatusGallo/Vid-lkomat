const NBSP = " ";

export const czk = (n: number): string =>
  new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .format(Math.round((n + Number.EPSILON) * 100) / 100) + NBSP + "Kč";

export const num1 = (n: number): string =>
  new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 }).format(n);

export const kfmt = (n: number): string =>
  n >= 1000 ? num1(n / 1000) + "k" : String(Math.round(n));

export const dateLabel = (iso: string): string => {
  const p = iso.split("-");
  return parseInt(p[2], 10) + ". " + parseInt(p[1], 10) + ".";
};

export const parseAmount = (s: string): number | null => {
  const n = parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
};

export const groupAmount = (str: string): string => {
  let s = String(str).replace(/\s/g, "").replace(/\./g, ",").replace(/[^0-9,]/g, "");
  const i = s.indexOf(",");
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, "");
  const parts = s.split(",");
  const intp = (parts[0] || "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.length > 1 ? intp + "," + parts[1].slice(0, 2) : intp;
};

export const todayISO = (): string => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

export const uid = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
