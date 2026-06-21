export const MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

export const MONTHS_SHORT = [
  "Led", "Úno", "Bře", "Dub", "Kvě", "Čvn",
  "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro",
];

export const STORAGE_KEY = "odtah_zaznamy_v1";

// Běžné kalendářní měsíce (1.–poslední den měsíce).
const _today = new Date();
export const CURRENT_YEAR = _today.getFullYear();
export const CURRENT_MONTH = _today.getMonth();
export const PROFIT_RATE = 0.3;
export const PROFIT_PCT = Math.round(PROFIT_RATE * 100);
export const VAT_RATE = 0.21;
export const VAT_PCT = Math.round(VAT_RATE * 100);
