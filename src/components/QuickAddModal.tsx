import { useEffect, useRef, useState } from "react";
import { PROFIT_RATE, PROFIT_PCT } from "../constants";
import { czk, groupAmount, parseAmount, todayISO } from "../utils/format";
import { Plus, X } from "../icons";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (m: number, date: string, amount: number) => void;
};

export function QuickAddModal({ open, onClose, onAdd }: Props) {
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDate(todayISO());
      setAmount("");
      setErr("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;
  const preview = parseAmount(amount);
  const submit = () => {
    const v = parseAmount(amount);
    if (v === null || v <= 0) {
      setErr("Zadej platnou částku větší než 0.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setErr("Neplatné datum.");
      return;
    }
    const m = parseInt(date.slice(5, 7), 10) - 1;
    onAdd(m, date, v);
  };

  return (
    <div className="od-modal-wrap" onClick={onClose}>
      <div className="od-modal od-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="od-modal-head">
          <h3>Rychlý zápis</h3>
          <button className="od-row-btn" onClick={onClose} title="Zavřít">
            <X size={15} />
          </button>
        </div>
        <p className="od-modal-sub">Datum určuje měsíc i rok záznamu.</p>
        <div className="od-form od-form-stack">
          <div className="od-field">
            <label>Datum</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="od-field">
            <label>Částka (Kč)</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder="např. 3 500"
              value={amount}
              onChange={(e) => setAmount(groupAmount(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="od-field">
            <label>Zisk {PROFIT_PCT} %</label>
            <div className="od-preview mono">{preview ? czk(preview * PROFIT_RATE) : "–"}</div>
          </div>
        </div>
        {err && <p className="od-err">{err}</p>}
        <div className="od-modal-acts">
          <button className="od-modal-cancel" onClick={onClose}>Zrušit</button>
          <button className="od-add" onClick={submit}>
            <Plus size={16} /> Přidat
          </button>
        </div>
      </div>
    </div>
  );
}
