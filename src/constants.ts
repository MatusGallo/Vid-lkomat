export const MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

export const MONTHS_SHORT = [
  "Led", "Úno", "Bře", "Dub", "Kvě", "Čvn",
  "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro",
];

export const STORAGE_KEY = "odtah_zaznamy_v1";

// Výplatní období: 21. dne předchozího měsíce → 20. dne daného měsíce.
// Měsíc se pojmenovává podle data konce (kdy přijde výplata), proto se
// zápisy od 21. počítají už do následujícího měsíce.
const _today = new Date();
const _periodMonth = _today.getDate() >= 21 ? _today.getMonth() + 1 : _today.getMonth();
export const CURRENT_YEAR = _periodMonth > 11 ? _today.getFullYear() + 1 : _today.getFullYear();
export const CURRENT_MONTH = _periodMonth > 11 ? 0 : _periodMonth;
export const PROFIT_RATE = 0.3;
export const PROFIT_PCT = Math.round(PROFIT_RATE * 100);
export const VAT_RATE = 0.21;
export const VAT_PCT = Math.round(VAT_RATE * 100);
